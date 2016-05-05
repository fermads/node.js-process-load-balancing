# Node.js process load balancing: comparing cluster, iptables and Nginx

Node is single threaded and to use more CPU cores we must create new processes and distribute the load.
This article is a comparison between three ways of doing process load balancing for Node.js web applications:

* Node cluster core module having a master process listen on a single port and distribute connections to workers
* iptables using prerouting to redirect connections to Node’s child processes listening on multiple ports
* Nginx as a reverse proxy passing connections to Node’s child processes listening on multiple ports

Tests ran on Node 6.0.0 and results mesured by a few metrics:

* Load distribution: how is the load spreaded across processes
* Total requests and request rate
* Memory used by master and workers
* CPU load averages: 1m and 5m

Note: This is not a stress test. I'm doing the same “average” load to compare results against each of the three solutions.

TLDR: Jump to the Results

## Motivation
I've been doing multi-machine, multi-core applications using Node since version 0.2.4 in 2010.
At that time, for security reasons I used Nginx as a reverse proxy to Node.
Later I began using iptables to forward connections to workers and recently I’ve been using Node's cluster module.

But why compare them? Node cluster module now looks like the obvious choice. Is it? A little bit of history...

In 2012 Node version 0.8 got the addition of the built-in cluster module.
Cluster lets you set up a master process that can handle load to worker processes.
The first implementation of the cluster module let the operational system decide how to distribute load.
That did not work as expected and, later in 2015, Ben confirmed the problem:

“Now, we get to the part where theory meets messy reality because it slowly became clear that the operating system’s idea of ‘best’ is not always aligned with that of the programmer. In particular, it was observed that sometimes – particularly on Linux and Solaris – most connections ended up in just two or three processes.” -- Ben Noordhuis

To fix that, Node 0.12 got a new implementation using a round-robin algorithmin to distribute the load between workers in a better way.
This is the default approach Node uses since then:

“... the master process listens on a port, accepts new connections and distributes them across the workers in a round-robin fashion” -- Node 0.12 cluster module documentation

This is what I want. Load evenly distributed between workers NOT done by the SO.
But if we keep reading the cluster module doc, we’ll get to this point:

“The [OS distribution] approach should, in theory, give the best performance.
In practice however, distribution tends to be very unbalanced due to operating system scheduler vagaries.
Loads have been observed where over 70% of all connections ended up in just two processes, out of a total of eight” -- Node 0.12 cluster module documentation

Same thing Ben Noordhuis said on his quote above. The OS distribution approach is essencially broken.
We already knew that. But there is another piece of information:
“the [OS distribution] approach should, in theory, give the best performance”.
So, the approach that gives the best performance is the one that I’m NOT using.

It begs the question: how much performance do we lose by using the better and default cluster approach compared to solutions that handle the load directly to workers? That’s what I wanted to find out.

## Setup and code
This test compare number of requests, memory and CPU usage of Node when running with Cluster module, iptables and Nginx as process load balancers.
Also, lets compare how well these solutions distribute connections between workers/child processes.

### Hardware & Software
* Machine receiving the load is physical hardware with 8GB RAM using Node.js v6.0.0. [cpuinfo]
* Machine generating the load has the same specs as above and is running [Siege] with [this command]
* sysctl, ulimits and friends configured to do not be a bottleneck for the tests

Cluster module with master/worker
```
[[code master and worker]]
```

iptables and child_processes
```
[[code master and worker]]
```
Iptables config
```
[[config]]
```

Nginx and child_processes
```
[[code master and worker]]
```
Nginx config
```
[[config]]
```

## Results

### Total requests and request rate

Shows how many responses to Siege requests these solutions where able give in 5 minutes.
Node.js webserver response is very simple, just “ok” for each request.

<img>

### Master process memory usage

These show how much memory Node’s master process is using when running with Cluster, iptables and Nginx (one graph each)

As expected while using the cluster module the master process is responsible for handling the load to workers.
That’s not free. Master process of cluster uses triple the amount of memory of the master process behind Nginx and iptables (which are doing nothing).

<img>

### Worker process memory usage
Shows how much memory Node’s worker 1 process is using when running with Cluster, iptables and Nginx (one graph each)
Altought I got stats from all workers I have graphs for worker 1 only

It does not matter if its from Cluster, iptables or Nginx. Graphs show that all workers use almost the same amount of memory.

<img>

### CPU load averages

These are 1m and 5m load averages of the machine running Node.js and receiving the load for each solution.
iptables is using a little bit less CPU. It keeps under 3.0 on 1m averages.
Nginx is a little higher with reason. Its a full webserver running alongside Node.

<img>

### Request distribution between processes
This is how each solution decided to spread load to their workers.
Don’t get too caught up by the bars. The numbers are not too distant from each other.
Also iptables is doing a perfect round-robin distribution.

<img>

Raw data, csv and final result files can be found [[here]]

## Conclusion and opinion
### Nginx
Nginx, being a full fledged webserver, did very well. One thing that is not accounted for is that Nginx will double the amount of sockets.
Using a reverse proxy will also create a connection between Nginx and Node.
If you need the security of a world class, full-featured webserver put Nginx in front of it

### Node cluster
Simple to implement and configure, things are kept inside Node's realm without depending on other software.
Just remember your master process will work almost as much as your worker processes and with a little less request rate then the other solutions.

### iptables
If you need to squeeze in every bit to get as much performance as possible, you should consider using iptables as your process load balancer.
The small downside is having to configure ports manually (and remembering to reconfigure if you deploy on machines with different number of CPU cores).

Fernando Miçalli
http://fermads.com


https://strongloop.com/strongblog/whats-new-in-node-js-v0-12-cluster-round-robin-load-balancing/
https://nodejs.org/docs/v0.12.0/api/cluster.html