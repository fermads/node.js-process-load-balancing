# Node.js process load balancing: comparing cluster, iptables and Nginx

Node is single threaded and to use more CPU cores we must create new processes and distribute the load. This article is a comparison between three ways of doing process load balancing for Node.js web applications:

* Node cluster core module having a master process listen on a port and distribute connections to workers
* iptables using prerouting to redirect connections to Node’s child processes listening on multiple ports
* Nginx as a reverse proxy passing connections to Node’s child processes listening on multiple ports

Tests ran on Node 6.0.0 and results measured by:

* Load distribution - how is the load spread across processes
* Total requests and request rate
* Memory used by master and workers

### Read the full article at https://goo.gl/53oGXl