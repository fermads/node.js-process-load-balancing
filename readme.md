# Node.js process load balance performance: comparing cluster module, iptables and Nginx

Node is single threaded and to use more CPU cores we must create new processes and distribute the load. This is a performance comparison between three ways of doing process load balancing for Node.js web applications:

* Node cluster core module having a master process listen on a port and distribute connections to workers
* iptables using prerouting to redirect connections to Node’s child processes listening on multiple ports
* Nginx as a reverse proxy passing connections to Node’s child processes listening on multiple ports

Tests ran on Node 6.0.0 and results measured by:

* Load distribution - how is the load spread across processes
* Total requests and request rate
* Memory used by master and workers

### Read full article with test results at https://goo.gl/53oGXl