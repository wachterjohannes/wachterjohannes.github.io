---
title: "Fetching a stranger's URL without getting burned"
description: "Client ID Metadata Documents make connecting an MCP client trivial for users and risky for servers. How I made the fetch safe, and what only real clients showed me."
pubDate: 2026-10-21
category: "// MCP"
readingTime: "4 min"
heroImage: "/images/posts/fetching-a-strangers-url-safely-header.png"
heroAlt: "Header: A stranger's URL. Making the fetch behind a client id safe, and what real clients sent."
tags: [mcp, oauth, security, php, symfony, sulu]
audio: "/audio/fetching-a-strangers-url-safely-en.mp3"
audioLabel: "Spoken version of this post, 5 min"
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member.*

Connecting an MCP client to a server with Client ID Metadata Documents (CIMD) takes three steps for the user: paste a URL, sign in, confirm. The server pays for that simplicity. It has to download a document from a URL that someone else picked, before it knows anything about that someone, and then trust enough of it to start an OAuth flow.

Nearly all the work in my implementation went into that one sentence. This post is about how I made the fetch safe in the Sulu MCP bundle, and what only real clients showed me. Where this code belongs is a different question, one I plan to take up in a companion post once it's ready.

## Why a URL as client id

Before CIMD there were two ways to introduce a client to an authorization server: register it by hand, or let it register itself over the network with Dynamic Client Registration. By hand does not scale to every assistant a user might connect. Self-registration scales, but it writes a new row on every connection and leaves the server deciding who may fill its table.

CIMD turns the client id into a URL. The document behind it describes the client, mostly its name and its redirect URIs. CIMD itself is still an IETF draft, so I treated everything about it as likely to move.

## Limiting the fetch

The URL is chosen by a stranger, so the fetch is the dangerous part. Server-side request forgery is the obvious risk: a URL that points at an internal address makes my server read something it should never show anyone. These are the limits.

- HTTPS only, and a host name instead of an IP address.
- Every address the host resolves to has to be public. One internal record is enough to reject the whole host.
- The request is pinned to the address I checked, so DNS cannot answer differently the second time, and the HTTP client is wrapped in `NoPrivateNetworkHttpClient` as a second lock in case my own check has a hole.
- No redirects, a short timeout, a hard cap on the size counted on the bytes that actually arrive instead of the `Content-Length` header, and JSON only.

The second decision matters as much as the limits: a fetch only starts on the authorization request of a user who is signed in, and each user can only introduce a bounded number of new URL clients per day. The token endpoint is public, so if it could trigger a fetch, anyone could make my server download URLs. There a stored client is served as it is.

## Broken is not the same as unreachable

A document that is invalid and a host that is down need different answers. An invalid document means the client is refused. An error response or a timeout means unavailable, and a client I have already stored can keep working on the data of its last successful fetch. An outage at somebody else's metadata host should not immediately turn a client I already know into an invalid one.

## A name nobody vouches for

The name in the document is whatever its owner wrote, so anyone can host a document that calls itself "Claude". The consent page shows `Name (host, not verified)`, and only hosts on a short `trusted_hosts` list lose the marker. A client never gets a secret, and a document can never take over a client that already has one.

## What real clients sent

I tested on 2026-10-19 with a local test application behind ngrok and real clients, after the unit tests were green. Three things broke that no unit test had predicted.

My strict grant type check refused the real claude.ai document, because it lists grant types beyond `authorization_code`. It now ignores the grants it does not know and demands only the one it needs.

Claude Code sends a redirect to `http://localhost/callback` and then listens on a random port. League applies the loopback leniency of RFC 8252 to `127.0.0.1` and `[::1]` but not to `localhost`, so the login failed with `invalid_client`. I added a grant class that extends the leniency to `localhost`, only for clients that identify themselves by URL.

ChatGPT's document asks for the token endpoint method `private_key_jwt`, which a public client is not supposed to use, so my validator refused it. I now accept the document if the method is `private_key_jwt` and `none` is listed as supported, store it as a public client and ignore its keys. This implementation does not treat those keys as establishing a confidential client, so it never verifies a `private_key_jwt` signature. The flow stays an authorization code flow with PKCE either way, and the consent page still says "not verified" unless the host is trusted. This is the decision I am least sure about. If you see a case where the missing signature check matters, I would like to hear it.

After that, ChatGPT and claude.ai both ran my `sulu_ping` tool as the signed-in user.

## What I would do first next time

I would fetch the real documents of the clients I want to support on day one and put them into the tests as fixtures, before writing a validator. All three surprises were things a document or a connection could have told me in the first hour.
