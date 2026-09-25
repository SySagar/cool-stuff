# Server-Driven UI (SDUI)

## 1. What is Server-Driven UI?

**Server-Driven UI (SDUI)** is an architecture where the **server
decides what UI should be displayed**, while the client application
mainly acts as a **renderer**.

In a traditional application, the client contains most of the screen
structure:

``` text
Client code
    ↓
"Show banner"
"Show product list"
"If user is logged in → show X"
    ↓
Rendered UI
```

With SDUI, the server can return a description of the UI:

``` json
{
  "screen": "home",
  "components": [
    {
      "type": "banner",
      "title": "50% OFF"
    },
    {
      "type": "product_list",
      "items": ["Pizza", "Burger", "Biryani"]
    }
  ]
}
```

The client already knows how to render `banner` and `product_list`, but
the **server controls which components appear and in what order**.

------------------------------------------------------------------------

## 2. High-Level Architecture

``` mermaid
flowchart LR
    U[User] --> C[Mobile / Web Client]

    C -->|Request screen| API[Backend / SDUI API]

    API --> B[Business Logic]
    API --> S[UI Schema / Screen Definition]
    B --> D[(Database)]

    S -->|JSON UI description| API
    API -->|Screen schema| C

    C --> R[Component Registry]
    R --> V[Native UI Components]

    V --> U
```

### The basic flow

``` text
User opens app
      |
      v
Client asks server for screen
      |
      v
Server determines:
- which components
- their order
- content
- configuration
- available actions
      |
      v
Server returns UI schema / JSON
      |
      v
Client parses schema
      |
      v
Component Registry finds matching component
      |
      v
Native UI is rendered
```

The important idea is:

> **The server sends instructions about WHAT to render; the client owns
> HOW each supported component is rendered.**

------------------------------------------------------------------------

# 3. Traditional UI vs SDUI

## Traditional client-driven UI

``` text
             ┌───────────────┐
             │    Backend    │
             │               │
             │ Data + APIs   │
             └───────┬───────┘
                     │
                     │ data
                     v
             ┌───────────────┐
             │    Client     │
             │               │
             │ Screen logic  │
             │ UI logic      │
             │ Experiments   │
             └───────┬───────┘
                     │
                     v
                    UI
```

The client decides the structure of the screen.

If the company wants to change the screen significantly, client code may
need to change and the application may need a new release.

------------------------------------------------------------------------

## Server-Driven UI

``` text
             ┌────────────────────┐
             │      Backend       │
             │                    │
             │ Business logic     │
             │ UI decisions       │
             │ Experiments        │
             │ Screen definition  │
             └─────────┬──────────┘
                       │
                 UI Schema / JSON
                       │
                       v
             ┌────────────────────┐
             │      Client       │
             │                    │
             │ Schema parser      │
             │ Component registry │
             │ Renderer           │
             └─────────┬──────────┘
                       │
                       v
                      UI
```

The server decides the composition of the screen, while the client
provides the reusable building blocks.

------------------------------------------------------------------------

# 4. Key Components of an SDUI System

## 4.1 UI Schema

The schema is the **contract between the server and client**.

Example:

``` json
{
  "type": "screen",
  "id": "home",
  "children": [
    {
      "type": "banner",
      "title": "20% off today"
    },
    {
      "type": "carousel",
      "items": ["item1", "item2", "item3"]
    },
    {
      "type": "button",
      "label": "Order Now",
      "action": "open_orders"
    }
  ]
}
```

The schema tells the client:

-   What components exist
-   Their hierarchy
-   Their properties
-   Their ordering
-   Available actions
-   Sometimes layout information
-   Sometimes visibility rules

------------------------------------------------------------------------

## 4.2 Component Registry

The client maintains a registry mapping server component types to native
components.

Conceptually:

``` text
"banner"       → BannerComponent
"carousel"     → CarouselComponent
"button"       → ButtonComponent
"product_list" → ProductListComponent
```

The server cannot magically create arbitrary UI.

It can only request components that the client already understands.

This is a very important limitation of SDUI.

------------------------------------------------------------------------

## 4.3 Renderer

The renderer walks through the schema and converts it into actual UI.

Conceptually:

``` text
JSON
 ↓
Parse
 ↓
Find component type
 ↓
Look up Component Registry
 ↓
Create native component
 ↓
Render
```

For example:

``` text
{
  "type": "button",
  "label": "Order Now"
}
```

becomes:

``` text
Button(
    text = "Order Now"
)
```

------------------------------------------------------------------------

## 4.4 Actions / Events

UI components usually need to interact with the backend.

For example:

``` json
{
  "type": "button",
  "label": "Order Now",
  "action": {
    "type": "navigate",
    "destination": "/orders"
  }
}
```

Another example:

``` json
{
  "type": "button",
  "label": "Apply Coupon",
  "action": {
    "type": "api",
    "endpoint": "/coupon/apply"
  }
}
```

A mature SDUI system therefore needs an **action/event model**, not just
a component model.

------------------------------------------------------------------------

## 4.5 Schema Versioning

This is one of the most important production concerns.

Suppose:

``` text
Server supports:

banner
carousel
product_list
new_fancy_component
```

But an old mobile application only understands:

``` text
banner
carousel
product_list
```

The server cannot safely send `new_fancy_component` to that old client.

Therefore SDUI systems often need:

-   Schema versions
-   Component versions
-   Client capability information
-   Backward-compatible fallbacks

Example:

``` text
Client v5
    ↓
"I understand:"
banner
carousel
product_list

Server
    ↓
Only sends compatible components
```

------------------------------------------------------------------------

# 5. What Problem Does SDUI Solve?

The main problem is **slow UI iteration across multiple clients**.

Imagine a company has:

``` text
iOS
Android
Web
```

and wants to change:

``` text
Home Screen
    ↓
Banner
    ↓
Product carousel
    ↓
Recommendation list
```

With a traditional architecture, UI behavior is often implemented
separately on multiple clients.

A product change can require:

``` text
Design
  ↓
iOS development
  ↓
Android development
  ↓
Web development
  ↓
Testing
  ↓
App releases
  ↓
Users update
```

SDUI changes the workflow:

``` text
Design / Product decision
          ↓
Backend changes UI configuration
          ↓
Server returns new schema
          ↓
Existing clients render it
```

This can significantly shorten the feedback loop for UI changes that fit
within the existing component vocabulary.

------------------------------------------------------------------------

# 6. Why Companies Use SDUI

## 6.1 Faster experimentation

A company can change:

``` text
Banner A
```

to:

``` text
Banner B
```

or change the ordering:

``` text
Banner
Products
Recommendations
```

to:

``` text
Recommendations
Banner
Products
```

without necessarily shipping new client code.

This is particularly useful for:

-   A/B testing
-   Promotions
-   Personalization
-   Regional experiences
-   Feature rollouts
-   Dynamic onboarding
-   Checkout/payment flows

------------------------------------------------------------------------

## 6.2 Multiple platforms

Without SDUI:

``` text
Backend
   |
   +---- iOS implementation
   |
   +---- Android implementation
   |
   +---- Web implementation
```

With SDUI:

``` text
                 Backend
                    |
               UI Schema
              /    |    \
             /     |     \
          iOS   Android   Web
           |       |       |
       Renderer Renderer Renderer
```

The UI schema can provide a common description while each platform still
renders using its own native components.

------------------------------------------------------------------------

## 6.3 Centralized business/UI decisions

For some flows, the server knows information that the client shouldn't
have to independently calculate.

For example:

``` text
User
 |
 +-- country = India
 +-- payment method = UPI
 +-- account = eligible
 +-- experiment = B
 |
 v
Backend
 |
 v
Return appropriate payment UI
```

The client doesn't need to reproduce all of those business rules.

------------------------------------------------------------------------

# 7. Example: Swiggy-style Dynamic Home Screen

A food-delivery application is a natural SDUI use case because the home
screen can change frequently.

For example:

``` text
Server
  |
  | User = Sagar
  | Location = Bangalore
  | Time = Dinner
  | Experiment = B
  |
  v
UI Schema
  |
  +--> Location header
  |
  +--> Promotional banner
  |
  +--> "20 min delivery" carousel
  |
  +--> Restaurant list
  |
  +--> Recommendations
  |
  v
Mobile Client
  |
  v
Rendered Home Screen
```

Swiggy has publicly described a **Dynamic Widget / server-driven UI
system**, where backend responses can control dynamic widgets and their
presentation.

The important architectural idea is that the server can compose a screen
from a set of known widgets instead of requiring every screen change to
be implemented entirely inside the client.

------------------------------------------------------------------------

# 8. Companies That Have Used or Documented Similar Approaches

The exact implementation differs between companies; SDUI is not one
standardized technology.

### Swiggy

Swiggy has publicly written about its **Dynamic Widget / Server-Driven
UI system**.

The approach is aimed at dynamically composing UI widgets and allowing
product changes to be controlled through backend-driven responses.

Reference:

https://bytes.swiggy.com/a-deep-dive-into-dynamic-widget-swiggys-server-driven-ui-system-92cdc3b16ec6

------------------------------------------------------------------------

### Airbnb

Airbnb has publicly documented server-driven experiences, including its
authentication system.

In its current authentication architecture, the server determines which
authentication challenge/screen should be shown and the client renders
the returned screen. Airbnb states that this reduced client code and
allowed many experiments to be run without requiring client changes.

Airbnb reported a **60% reduction in code** for this authentication
system and a **100 KB reduction in the web client bundle**.

Source:

https://airbnb.tech/uncategorized/flexible-authentication-reimagining-authentication-for-millions-of-users-at-airbnb/

------------------------------------------------------------------------

### DoorDash

DoorDash has publicly discussed its **Mosaic** framework and
server-driven UI patterns, particularly for internal/support tooling.

The broader pattern is the same: reusable client components are combined
according to backend-controlled configuration.

------------------------------------------------------------------------

### Lyft

Lyft has also publicly discussed server-driven UI approaches, including
its Canvas framework, to enable faster UI experimentation and iteration.

------------------------------------------------------------------------

### Nubank

Nubank has publicly discussed **Backend Driven Content**, including
using server-controlled content/configuration with Flutter components.

------------------------------------------------------------------------

## Important distinction

Not every company above necessarily uses SDUI for its entire
application.

A company might use server-driven UI for only:

``` text
Authentication
Checkout
Home screen
Promotional widgets
Payments
Onboarding
Internal tools
```

This is often more practical than making every part of the application
server-driven.

------------------------------------------------------------------------

# 9. SDUI Is NOT the Same as a WebView

This is a common misconception.

### WebView

``` text
Server
  |
  v
HTML / CSS / JS
  |
  v
WebView
```

The application essentially embeds a web page.

### SDUI

``` text
Server
  |
  v
UI Schema
  |
  v
Native Component Registry
  |
  v
Native UI
```

For example:

``` text
"button"
   ↓
Native iOS Button
```

or:

``` text
"button"
   ↓
Native Android Button
```

The server describes the UI, but the client still renders it using its
own component system.

------------------------------------------------------------------------

# 10. Advantages

## 10.1 Faster UI releases

Many changes can happen server-side without waiting for a full client
release.

------------------------------------------------------------------------

## 10.2 Faster A/B testing

The backend can return different UI trees:

``` text
Experiment A

Banner
Products
Recommendations
```

versus:

``` text
Experiment B

Recommendations
Banner
Products
```

The client doesn't necessarily need separate hardcoded implementations
for every experiment.

------------------------------------------------------------------------

## 10.3 Cross-platform consistency

The same high-level UI schema can drive:

``` text
iOS
Android
Web
```

while each platform maintains native rendering.

------------------------------------------------------------------------

## 10.4 Centralized business logic

Business decisions can stay closer to backend systems.

This avoids duplicating complex rules across:

``` text
iOS code
Android code
Web code
```

------------------------------------------------------------------------

## 10.5 Smaller client logic

The client can become more focused on:

``` text
Parse
 ↓
Validate
 ↓
Render
 ↓
Send actions
```

rather than containing large amounts of screen orchestration logic.

------------------------------------------------------------------------

# 11. Disadvantages

## 11.1 Increased backend complexity

You haven't eliminated complexity.

You moved some of it.

Instead of:

``` text
Complex client
+
Simple API
```

you may end up with:

``` text
Simpler client
+
Complex SDUI backend
+
Schema system
+
Renderer
+
Versioning
+
Fallbacks
+
Observability
```

------------------------------------------------------------------------

## 11.2 Network dependency

Traditional UI can often render known screens immediately.

With SDUI:

``` text
Open screen
   ↓
Request schema
   ↓
Wait for server
   ↓
Render
```

Poor connectivity can therefore become a UX problem.

Caching and local fallbacks become important.

------------------------------------------------------------------------

## 11.3 Debugging becomes harder

A UI bug might involve:

``` text
Backend
   ↓
Schema
   ↓
Network
   ↓
Client parser
   ↓
Component registry
   ↓
Native component
```

Instead of simply:

``` text
Client code → UI
```

This increases the debugging surface.

------------------------------------------------------------------------

## 11.4 Schema compatibility

Old clients may not understand new components.

Example:

``` text
Server:
    "new_card"

Old client:
    ❌ doesn't know "new_card"
```

Therefore teams need:

-   Schema versioning
-   Capability negotiation
-   Graceful fallback
-   Backward compatibility
-   Controlled rollout

------------------------------------------------------------------------

## 11.5 Payload size

If the server sends a large UI tree on every request:

``` text
Huge JSON
     ↓
Network cost
     ↓
Parsing cost
     ↓
Rendering cost
```

Caching, compression, incremental updates, and careful schema design
become important.

------------------------------------------------------------------------

## 11.6 Not everything should be server-driven

Some UI is inherently client-heavy.

Examples:

``` text
Camera
Maps
Complex animations
Games
Video playback
Offline-first workflows
Highly interactive editors
```

For these, pushing too much control to the server can make the
architecture unnecessarily complicated.

------------------------------------------------------------------------

# References

1.  [Swiggy --- A Deep Dive into Dynamic Widget / Server-Driven
    UI](https://bytes.swiggy.com/a-deep-dive-into-dynamic-widget-swiggys-server-driven-ui-system-92cdc3b16ec6)

2.  [Coding a Server-Driven UI ---
    Adeesh](https://adeesh.hashnode.dev/coding-a-server-driven-ui)

3.  [Airbnb Engineering --- Flexible Authentication: Reimagining
    authentication for millions of users at
    Airbnb](https://airbnb.tech/uncategorized/flexible-authentication-reimagining-authentication-for-millions-of-users-at-airbnb/)
