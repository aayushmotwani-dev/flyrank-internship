# DNS walkthrough for my hosted portfolio

DNS is the directory that maps a human-friendly name to the place serving a website. When someone types a URL, the browser first asks a DNS resolver for the address. The resolver may already have a cached answer; otherwise it asks the relevant nameservers, follows the domain's records, and returns the result to the browser.

A nameserver is the service responsible for answering DNS questions for a domain. The DNS zone contains records such as an A record, which points a name to an IP address, and a CNAME record, which points one hostname at another hostname. A CNAME is useful when a host wants to keep its infrastructure address changeable while my domain continues to point at the host's stable name.

For this portfolio, GitHub Pages provides the public HTTPS URL, so I did not buy or configure a custom domain. If I later use one, the usual flow is to add the host's requested record at my DNS provider, wait for resolvers to see the change, and then let the host issue an HTTPS certificate for the verified domain. The browser's request then goes: URL → resolver → nameserver/record → hosting service → HTTPS response.

There are two practical delays to remember. DNS answers are cached according to their TTL, so a record change is not always visible everywhere immediately. Also, DNS only finds the host; the host still has to be configured to serve the right site for that hostname and certificate.

I checked the current GitHub Pages URL publicly and kept the explanation separate from the HTML so I can update the site without hiding the infrastructure details.
