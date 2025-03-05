#### Real Scenario:
Imagine you have a Laravel application where admin doing some tasks like:  sending email to users from the application’s email facilities. So, how the logged in user knows that an important email dispatched to him while he is also doing his task in the application? May be the logged in user by clicking the email lists button to check if there has any new email arrived or may be another option – automatic notification that a new email arrived. For the first scenario when clicking email list button to view, an API request can call to retrieve the email list or by refreshing, reloading pages but for the second, need a mechanism to notify user that a new email arrived and here comes the WebSockets that are used to implement real-time, live-updating user interfaces.


#### Websocket and Laravel Broadcasting:
When some data is updated on the server, sometimes client need to be handled the datas in real time without making any API request manually or by continual polling request to application server. Websocket make a communication that when data updated in server, a message is typically sent over a WebSocket connection to be handled by the client. Clients don’t need to send request for updated datas or refresh the page. Laravel makes it easy to ‘broadcast’ server-side Laravel events over a WebSocket connection. By broadcasting Laravel events allowing to share the same event names and data between server-side Laravel application and client-side JavaScript application.

According Laravel the core concepts behind broadcasting are simple: clients connect to named channels on the frontend, while your Laravel application broadcasts events to these channels on the backend. These events can contain any additional data you wish to make available to the frontend.


#### Supporting Drivers according Laravel 12.x:
There are currently three server-side broadcasting drivers by default in Laravel:        
> * [Laravel Reverb](https://reverb.laravel.com/)   
> * [Pusher Channels](https://pusher.com/channels)   
> * [Ably]( https://ably.com/)
  
In this article we will discuss in details about ‘Pusher’, the most popular, old and leader in realtime communication. By incorporating Laravel’s event broadcasting using ‘Pusher’ connection client can be handled with updated datas in the frontend without refreshing or reloading pages while data updated in the backend.


#### Prerequisite Knowledge:
###### Event and Listener:
Though Laravel utilize event broadcasting by using **Pusher** channel (also **Reverb**, **Ably**) to make realtime communication of datas between server and client it is very important to know about Laravel’s [events and listeners]( https://laravel.com/docs/12.x/events).

###### Pusher:
In this article we are focusing mainly on **Pusher**, a **websocket service** that Laravel uses to **Broadcast Events**. It allows real-time updates without page reloads between the Laravel backend and the frontend (**React**, **Vue**, etc.) using **WebSockets**.
***Pusher Event Broadcasting Flow in Laravel:***
🔹 **User Action** → Any action (e.g., creating or updating or deleting a user etc.).   
🔹 **Event Fired** → Dispatched event when an action occured (e.g., UserCreated event dispatched on user create action).  
🔹 **Event Broadcast** → Sent via Pusher Websockets.   
🔹 **Client Listens** → Frontend or JavaScript listens to Pusher updates.  
🔹 **UI Updates in Real-Times**

