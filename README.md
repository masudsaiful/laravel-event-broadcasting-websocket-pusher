#### Real Scenario:
Imagine a multi-tenant application where, when a new user is created, there is a ref_by column that stores the parent user's ID. At the client side, how can the parent user know that a new user has been created? Either the parent user would need to manually refresh the page to see the updated status, or we need a mechanism to automatically update the client in real-time. This is where WebSockets come in — they allow us to implement real-time, live-updating user interfaces without requiring page refreshes.




#### Websocket and Laravel Broadcasting:
When some data is updated on the server, sometimes client need to be handled the datas in real time without making any API request manually or by continual polling request to application server. Websocket make a communication that when data updated in server, a message is typically sent over a WebSocket connection to be handled by the client. Clients don’t need to send request for updated datas or refresh the page. Laravel makes it easy to ‘broadcast’ server-side Laravel events over a WebSocket connection. By broadcasting Laravel events allowing to share the same event names and data between server-side Laravel application and client-side JavaScript application.

According Laravel the core concepts behind broadcasting are simple: clients connect to named channels on the frontend, while your Laravel application broadcasts events to these channels on the backend. These events can contain any additional data you wish to make available to the frontend.

**At a glance Laravel Event Broadcasting Workflow:**        
> * The backend dispatches an event to hosted websocket   
> * The hosted websocket broadcast (like Pusher) the event to listen by the subscribers  
> * The frontend listens to the events using Laravel Echo and updates the UI




#### Supporting Drivers according Laravel 12.x:
**There are currently three server-side broadcasting drivers by default in Laravel:**        
> * [Laravel Reverb](https://reverb.laravel.com/)   
> * [Pusher Channels](https://pusher.com/channels)   
> * [Ably]( https://ably.com/)
  
In this article we will discuss in details about __‘Pusher’__, the most popular, old and leader in realtime communication. By incorporating Laravel’s event broadcasting using __‘Pusher’__ connection client can be handled with updated datas in the frontend without refreshing or reloading pages while data updated in the backend.




#### Prerequisite Knowledge:
Before getting started let's take a look of the followings that are needed while working on **Laravel Broadcasting**. For better understanding I will recommened specifically to read Laravel official docs of **Event**, **Listener**, **Model Observer** and **Broadcasting**. 

###### (A) Event and Listener:
Though Laravel utilize event broadcasting by using **Pusher** channel (also **Reverb**, **Ably**) to make realtime communication of datas between server and client it is very important to know about Laravel’s [events and listeners]( https://laravel.com/docs/12.x/events).



###### (B) Queue:
Laravel provides queue workers to manage tasks asynchronously, allowing tasks to run in parallel without blocking each other. To use queues, you need to configure a queue driver and create jobs that handle specific tasks. In Laravel, all event broadcasting is handled through queued jobs to ensure that the application's response time is not seriously impacted by broadcasting events. Therefore, before starting with __Laravel Event Broadcasting__, it is important to have at least a basic understanding of [Laravel Queues](https://laravel.com/docs/12.x/queues).



###### (C) Pusher:
In this article we are focusing mainly on **Pusher**, a **websocket service** that Laravel uses to **Broadcast Events**. It allows real-time updates without page reloads between the Laravel backend and the frontend (**React**, **Vue**, etc.) using **WebSockets**.  
* ***Pusher Event Broadcasting Flow in Laravel:***    
🔹 **User Action** → Any action (e.g., creating or updating or deleting a user etc.).   
🔹 **Event Fired** → Dispatched event when an action occured (e.g., UserCreated event dispatched on user create action).  
🔹 **Event Broadcast** → Sent via Pusher Websockets.   
🔹 **Client Listens** → Frontend or JavaScript listens to Pusher updates.  
🔹 **UI Updates in Real-Times**
* ***Type of Pusher Services:***  
Pusher offers two services:  
🔹 **Pusher Channels** → Used for real-time event broadcasting (This is what we need for Laravel).     
🔹 **Pusher Beams** → Used for push notifications (Not needed for Laravel broadcasting).    
Since we are working with **Laravel event broadcasting**, we will use **Pusher Channels**.

###### (D) Broadcast Channels:  
* ***What is it?:***    
🔹 Channels define who can listen to a broadcasted event.   
🔹 Laravel supports public, private, and presence channels.  
* ***Types of Channels:***  
🔹 **Public Channel** → Anyone can listen (e.g., general announcements).     
🔹 **Private Channel** → Only authorized users can listen (e.g., notifications for a specific user).  
🔹 **Presence Channel** → Like private channels but tracks active users (e.g., online user lists).     
* ***Purpose:***  
🔹 Controls **who can access broadcasted events**.     
🔹 Ensures **security** for sensitive data. 
* ***Workflow:***  
🔹 A user **performs an action** (e.g., sends a message).     
🔹 The event is **broadcasted to a specific channel**.  
🔹 Only authorized clients receive the update.    
* ***When is it needed?***  
🔹 When real-time events require **restricted access** based on user roles or authentication.      

###### (E) Laravel Echo:  
* ***What is it?:***    
🔹 A JavaScript library that listens for Laravel’s broadcasted events on the frontend.   
🔹 Works with WebSockets (via Pusher, Redis, or others).  
* ***Purpose:***  
🔹 Receives **real-time event updates** from the backend and updates the UI accordingly.          
* ***Workflow:***  
🔹 The frontend subscribes to a **broadcast channel** using Laravel Echo.     
🔹 When an event is broadcasted, Echo **listens and receives the event data**.  
🔹 The UI is **updated dynamically** based on the event data.    
* ***When is it needed?***  
🔹 When implementing real-time features in **React, Vue, or any frontend framework** with Laravel.




#### Necessary Package Installation:
###### (A) Backend (Laravel) Package Installation:  
* ***Install Laravel Pusher Package:***  
```php
    composer require pusher/pusher-php-server
```
* ***Why is this package necessary?***  
🔹 It provides Laravel with the ability to **send events to Pusher**.     
🔹 The `pusher/pusher-php-server` package acts as a bridge between Laravel and Pusher.    
* ***How does it work? (Workflow)***  
🔹 When an event occurs (e.g., user creation), Laravel **dispatches an event**.     
🔹 This package takes the event data and **sends it to Pusher**.    
🔹 Pusher then **broadcasts it to all subscribed clients** in real-time.  

###### (B) Frontend (React) Package Installation:  
* ***Install Laravel Echo & Pusher JS Library:***  
```php
    npm install --save laravel-echo pusher-js
```
* ***Why is this package necessary?***  
🔹 `laravel-echo` Helps React listen for Laravel events.     
🔹 `pusher-js` Enables WebSocket connections to **receive real-time events** from Pusher.    
* ***How does it work? (Workflow)***  
🔹 `laravel-echo` **connects React to Pusher** and listens for Laravel events..     
🔹 `pusher-js` creates a **WebSocket connection** with Pusher.    
🔹 When an event is broadcasted, **React receives** it and updates the UI dynamically.  




#### Settings and Configurations (Laravel):
###### (A) Enable Laravel Broadcasting by Configuring .env:
Laravel needs to know which broadcasting driver to use. Since, we are using **Pusher**, we set BROADCAST_DRIVER=pusher. The app ID, key, secret, and cluster that we already get from **Pusher Dashboard**, ensure secure communication between Laravel and Pusher.  

* ***.env Configuration:***  
```php
    BROADCAST_DRIVER=pusher
    PUSHER_APP_ID=your_app_id
    PUSHER_APP_KEY=your_app_key
    PUSHER_APP_SECRET=your_app_secret
    PUSHER_APP_CLUSTER=your_cluster
```

###### (B) Configure `config/broadcasting.php`:
Open `config/broadcasting.php` and update the `connections` array:.  

* ***config/broadcasting.php Configuration:***  
```php
    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true,
            ],
        ],
    ],
```
* ***Why is this necessary?***  
🔹 This ensures Laravel uses **Pusher as the broadcast driver**.     
🔹 `useTLS => true` ensures **secure WebSocket communication** with Pusher.      

###### (C) Check Broadcast Service Provider is Enabled:
Laravel already includes the `BroadcastServiceProvider`. Ensure it's enabled in `config/app.php`:.  

* ***BroadcastServiceProvider should be enabled in config/app.php:***  
```php
    App\Providers\BroadcastServiceProvider::class,
```

###### (D) inside `app/Providers/BroadcastServiceProvider.php`, update the `boot()` method:

* ***By default boot() should be like the following:***  
```php
    public function boot()
    {
        Broadcast::routes();
        require base_path('routes/channels.php');
    }
```
* ***Why is this necessary?***  
🔹 `Broadcast::routes();` registers **broadcasting routes**.     
🔹 `routes/channels.php` defines **who can listen to private events**.

###### (E) Define a Broadcast Channel in `routes/channels.php`:
This file controls **who can listen to private broadcast channels**.  

* ***`routes/channels.php` Defined:***  
```php
    use Illuminate\Support\Facades\Broadcast;
    
    Broadcast::channel('users.{userId}', function ($user, $userId) {
        return (int) $user->id === (int) $userId;
    });
```
* ***Why is this necessary?***  
🔹 This ensures only **authorized users** can listen to a private channel (e.g., users.5 is for user ID 5).     
🔹 Without this, **anyone could listen** to private broadcasts, causing security risks.




#### Settings and Configurations (React):
###### (A) Update `.env` in React:
***Inside your React project, add the following to the `.env` file:***  
`.env` file
```php
    REACT_APP_PUSHER_APP_KEY=your_pusher_app_key
    REACT_APP_PUSHER_APP_CLUSTER=your_pusher_app_cluster
```   
***Why is this necessary?***    
🔹 Stores Pusher credentials for use in `echo.js`.     

###### (B) Configure Laravel Echo in React:
***Inside the React project, create a new file `src/echo.js`:***
```php
    import Echo from 'laravel-echo';
    import Pusher from 'pusher-js';
    
    window.Pusher = Pusher;
    
    const echo = new Echo({
        broadcaster: 'pusher',
        key: process.env.REACT_APP_PUSHER_APP_KEY,
        cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
        encrypted: true
    });
    
    export default echo;
```   
***Why is this necessary?***    
🔹 Sets up Laravel `Echo` to listen for events from Pusher in React.     




#### Laravel Backend Implementation:
###### (A) Event and Listener:
Though Laravel utilize event broadcasting by using **Pusher** channel (also **Reverb**, **Ably**) to make realtime communication of datas between server and client it is very important to know about Laravel’s [events and listeners]( https://laravel.com/docs/12.x/events).

###### (B) Pusher:
In this article we are focusing mainly on **Pusher**, a **websocket service** that Laravel uses to **Broadcast Events**. It allows real-time updates without page reloads between the Laravel backend and the frontend (**React**, **Vue**, etc.) using **WebSockets**.

* ***How to Get Pusher Credentials (Free Signup) (Laravel 11.x and 12.x perspective):***  
***Step 1: Create a Free Pusher Account***  
🔹 Got to **[Pusher's Website](https://pusher.com/)**.     
🔹 Click on **Sign up** for free.    
🔹 Follow the Instructions.  
🔹 **Verify E-mail** if required.<br /><br />
***Step 2: Create a New Pusher App***  
🔹 After logging in, go to **Pusher Dashboard**.     
🔹 Click **Create App**.    
🔹 Select **Frontend** and **Backend** technologies.  
🔹 Click **Create App**.<br /><br /> 
***Step 3: Get Pusher Credentials***  
Once the app is created, you will see the **App Keys**  
🔹 **App ID**.     
🔹 **Key**.    
🔹 **Secret**.  
🔹 **Cluster**.   
These credentials are needed for **Laravel Broadcasting**
* ***Configure Pusher in Laravel 11.x or 12.x:***  
Once we have the **Pusher** credentials, we can now configure them in Laravel.<br /><br /> 
***Step 1: Add Credential to Laravel .env file***  
Open .env in Laravel Project and add:
```php
    PUSHER_APP_ID:your_app_id      
    PUSHER_APP_KEY:your_app_key      
    PUSHER_APP_SECRET:your_app_secret  
    PUSHER_APP_CLUSTER:your_app_cluster
```
Replace **your_app_id, your_app_key, your_app_secret, your_app_cluster** with the actual values from the **Pusher dashboard**.

***Step 2: Check Configuration and Channels in Laravel***  
If you have no `config/broadcasting.php` and `routes/channels` files in your Laravel project, run the following command in terminal.     
```php
    php artisan install:broadcasting
```
This command will create the `config/broadcasting.php` and `routes/channels` files.

***Step 3: Configure Broadcasting in Laravel***    
Once **config/broadcasting.php** configuration file, find the **pusher** section and ensure it matches.   
```php
  'pusher' => [
      'driver' => 'pusher',
      'key' => env('PUSHER_APP_KEY'),
      'secret' => env('PUSHER_APP_SECRET'),
      'app_id' => env('PUSHER_APP_ID'),
      'options' => [
          'cluster' => env('PUSHER_APP_CLUSTER'),
          'useTLS' => true,
      ],
  ],
```   
Ensure that set `useTLS => true` for secure WebSocket connections.




#### Settings and Configurations:
###### (A) Event and Listener:
Though Laravel utilize event broadcasting by using **Pusher** channel (also **Reverb**, **Ably**) to make realtime communication of datas between server and client it is very important to know about Laravel’s [events and listeners]( https://laravel.com/docs/12.x/events).

###### (B) Pusher:
In this article we are focusing mainly on **Pusher**, a **websocket service** that Laravel uses to **Broadcast Events**. It allows real-time updates without page reloads between the Laravel backend and the frontend (**React**, **Vue**, etc.) using **WebSockets**.

* ***How to Get Pusher Credentials (Free Signup) (Laravel 11.x and 12.x perspective):***  
***Step 1: Create a Free Pusher Account***  
🔹 Got to **[Pusher's Website](https://pusher.com/)**.     
🔹 Click on **Sign up** for free.    
🔹 Follow the Instructions.  
🔹 **Verify E-mail** if required.<br /><br />
***Step 2: Create a New Pusher App***  
🔹 After logging in, go to **Pusher Dashboard**.     
🔹 Click **Create App**.    
🔹 Select **Frontend** and **Backend** technologies.  
🔹 Click **Create App**.<br /><br /> 
***Step 3: Get Pusher Credentials***  
Once the app is created, you will see the **App Keys**  
🔹 **App ID**.     
🔹 **Key**.    
🔹 **Secret**.  
🔹 **Cluster**.   
These credentials are needed for **Laravel Broadcasting**
* ***Configure Pusher in Laravel 11.x or 12.x:***  
Once we have the **Pusher** credentials, we can now configure them in Laravel.<br /><br /> 
***Step 1: Add Credential to Laravel .env file***  
Open .env in Laravel Project and add:
```php
    PUSHER_APP_ID:your_app_id      
    PUSHER_APP_KEY:your_app_key      
    PUSHER_APP_SECRET:your_app_secret  
    PUSHER_APP_CLUSTER:your_app_cluster
```
Replace **your_app_id, your_app_key, your_app_secret, your_app_cluster** with the actual values from the **Pusher dashboard**.

***Step 2: Check Configuration and Channels in Laravel***  
If you have no `config/broadcasting.php` and `routes/channels` files in your Laravel project, run the following command in terminal.     
```php
    php artisan install:broadcasting
```
This command will create the `config/broadcasting.php` and `routes/channels` files.

***Step 3: Configure Broadcasting in Laravel***    
Once **config/broadcasting.php** configuration file, find the **pusher** section and ensure it matches.   
```php
  'pusher' => [
      'driver' => 'pusher',
      'key' => env('PUSHER_APP_KEY'),
      'secret' => env('PUSHER_APP_SECRET'),
      'app_id' => env('PUSHER_APP_ID'),
      'options' => [
          'cluster' => env('PUSHER_APP_CLUSTER'),
          'useTLS' => true,
      ],
  ],
```   
Ensure that set `useTLS => true` for secure WebSocket connections.
