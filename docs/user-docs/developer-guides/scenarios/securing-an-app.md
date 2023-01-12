# Securing an app

## Introduction

The first rule of securing client-side applications is: the client cannot be trusted. Your backend should never trust the input from the front end under any circumstance. Malicious individuals often know how to use browser debug tools and manually craft HTTP requests to your backend.&#x20;

You may even find yourself in a situation where a disgruntled employee (or former employee), an engineer with intimate knowledge of the system, is seeking revenge by attempting a malicious attack.

**Your primary mechanism for securing any SPA application, Aurelia or otherwise, is to work hard at securing your backend services.**

{% hint style="warning" %}
**Security Advice**

This article only contains a few basic tips. It is in no way exhaustive, nor should it be your only resource for securing your application. The bulk of the security work you will set up in your application falls on your server-side technology. You should spend adequate time reading up on and understanding security best practices for whatever backend tech you have chosen.
{% endhint %}

## Authentication and authorization

When designing your application, consider which backend API calls can be made anonymously, which require a logged-in user, and which roles or permissions are required for various authenticated requests.&#x20;

Ensure that your entire API surface area is explicitly covered in this way. Your front end can facilitate the login process, but ultimately this is a backend task. Here are a few related recommendations:

* Make sure your server is configured to transmit sensitive resources over HTTPS. You may want to transmit all resources this way. It is more server-intensive, but it will be more secure. You must decide what is appropriate for your application.
* Don't transmit passwords in plain text.
* There are various ways to accomplish CORS. Prefer to use a technique based on server-supported CORS rather than client-side hacks.
* Control cross-domain requests to your services. Either disallow them or configure your server using a strict allow list of allowed domains.
* Require strong passwords
* Never, ever store passwords in plain text.
* Do not allow multiple failed login attempts to the same account.
* Consider outsourcing your auth requirements to a cloud provider with greater expertise.

You can improve the user experience by plugging into Aurelia's router pipeline with your security specifics. Again, remember, this doesn't secure your app but only provides a smooth user experience. The real security is on the backend.

We have a working example [here](https://github.com/aurelia/aurelia2-examples/tree/main/examples/advanced-routing) to learn how to implement authorization checks using the router.

## Validation and sanitization

The backend should always perform validation and sanitization of data. Do not rely on your client-side validation and sanitization code. Your client-side validation/sanitization code should not be seen as anything more than a User Experience enhancement designed to aid honest users. It will not affect anyone acting maliciously.

Here are a few things you should do, though:

* Use client-side validation. This will make your users happy.
* Avoid data-binding to `innerHTML`. If you do, be sure to use a value converter to sanitize the input from the user.
* Be extra careful anytime you are dynamically creating and compiling client-side templates based on user input.
* Be extra careful anytime you are dynamically creating templates on the server based on user input, which will later be processed by Aurelia on the client.

{% hint style="success" %}
**We Are Trying To Help You**

Internally, Aurelia makes no use of `eval` or the `Function` constructor. Additionally, all binding expressions are parsed by our strict parser, which does not make globals like `window` or `document` available in binding expressions. We've done this to help prevent some common abuses.
{% endhint %}

## Secret data

Do not embed private keys into your JavaScript code. While the average user may not be able to access them, anyone with ill intent can download your client code, un-minify it and use basic regular expressions on the codebase to find things that _look like_ sensitive data.&#x20;

Perhaps they've discovered what backend technology you are using or what cloud services your product is based on simply by studying your app's HTTP requests or looking at the page source. Using that information, they may refine their search based on certain patterns well-known to users of those technologies, making it easier to find your private keys.

If you need to acquire any secret data on the client, it should be done with great care. Here is a (non-exhaustive) list of recommendations:

* Always use HTTPS to transmit this information.
* Restrict which users and roles can acquire this information to an absolute minimum.
* Always use time-outs on any secret keys so that, at most, if an attacker gains access, they can't use them for long.
* Be careful how you store these values in memory. Do not store these as class property values or on any object linked to the DOM through data-binding or otherwise. Doing so would allow an attacker to access the information through the debug console. If you must store this information, keep it inside a private (non-exported) module-level variable.
* If you need to store this information anywhere, encrypt it first.

## Deployment

When deploying your apps, there are a few things you can do to make it more difficult for attackers to figure out how your client works:

* Bundle your application and minify it. This is the most basic obfuscation you can do.
* Do not deploy the original client-side source files. Only deploy your bundled, minified app.
* For additional security or IP protection, you may want to look into products such as [jscrambler](https://jscrambler.com/en/).

## Prepare for the inevitable

Even with the most skilled, security-proficient development team, your app will never be 100% protected. This is a fundamental assumption that you should have from the beginning. Expect to be attacked and expect someone to succeed at some point in time. What will you do if this happens? How will you respond? Will you be able to track down the culprit? Will you be able to identify the issue and quickly seal up the breach? You need a plan.

Again, most of this comes down to server-side implementation. Here are a few basic ideas:

* Configure server-side logging and make sure it will provide you with useful information. Such information can be very helpful in tracking down how an attack was performed. Make sure you have tools to quickly search through your logs.
* Make sure that all logins are logged. If you use an auth-token scheme, ensure all requests log this information.
* Never log sensitive data.
* Consider timing out logins or auth tokens. You can provide refresh mechanisms to help the user experience.
* Configure server insight tooling so that threats can be detected earlier.
