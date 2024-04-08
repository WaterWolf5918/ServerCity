ServerCity makes use of both a socket.io server and http rest server running on port 5010.
This document is to help you understand how to interface with both.

# RESTful API
### GET: /servers
##### C -> S
Returns an array of json objects with the following format

| key | type | value |
| ---- | ---- | ---- |
| name | string | User friendly name can contain spaces and other chars. |
| id | string | Computer friendly name, is normally the name but with spaces replaced with - and all lowercase. |
| path | string | Filesystem path in string form. |

### GET: /getConsole/:serverID/
#### C -> S
Returns an array of strings, each string is one non word wrapped line.

### GET: /status/:serverID/
#### C -> S
Returns a JSON object with the following format



### POST: /stop/:serverID/
#### C -> S
Returns a http status code

| HTTP Code | Desc |
| ---- | ---- |
| 200 | Server was found and /stop was sent in console. |
| 404 | Server was not found. |

### POST: /stop/:serverID/force

#### C -> S
Returns a http status code

| HTTP Code | Desc |
| ---- | ---- |
| 200 | Server was found and the child process it was running is was force killed. |
| 404 | Server was not found. |

### POST: /start/:serverID/
#### C -> S
Returns a http status code

| HTTP Code | Desc |
| ---- | ---- |
| 200 | Server was found and was sent a start command |
| 404 | Server was not found. |

### POST: /command/:serverID/
#### C -> S
Client should send a JSON body as listed below

```json
{
	command: "(Minecraft Command To Run)"
}
```

Returns a http status code

| HTTP Code | Desc |
| ---- | ---- |
| 200 | Server was found and command was sent. |
| 404 | Server was not found. |

# Socket.IO
### Event: start
#### S -> C
Event is sent when a server is started.
Returns a JSON object see below.

```json
{
	serverID: "(ID of the server that just started)"
}
```

### Event: close
#### S -> C
Event is sent when the child process running the Minecraft server is closed or killed.
Returns a JSON object see below.

```json
{
	serverID: "(ID of the server that just stopped)"
}
```

### Event: console
#### S -> C
Event is sent when the server sends a line to the console.
Returns a JSON object see below.

```json
{
	serverID: "(ID of the server who sent the event)",
	message: "(String containing the current line of console output)"
}
```

