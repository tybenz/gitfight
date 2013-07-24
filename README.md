Gitfight
========

Git-based fighting game

## How to start a game

1. Fork this repo and add your opponent as a collaborator\*
2. Create a branch for your game and make sure your opponent knows which branch to pull from
3. Tweak `gitwar.users` (see below)
4. Run `./setup && ./gitwar -c` to download gitwar and setup your game
5. Run the `./gitchess` and start playing

\* If you don't have anyone to play with. Submit an [issue](https://github.com/gitwar/gitchess/issues)
saying something like, "I need a partner!", and wait for someone to reply

## User file

Syntax is "user1,user2". Here's an example gitwar.users:

```
tybenz,tabenziger
```

## Actual gameplay

Types of punches you can throw:

- H - Haymaker
- U - Uppercut
- L - Left hook
- J - Jab

Pay attention to that order. The later in the list the more likely your
punch will strike your opponent. But keep in mind the riskier punches
deal more damage when they do land.

Get to fighting!

------
http://tybenz.com

[Gitwar logo](http://thenounproject.com/noun/soldier/#icon-No1697) designed
by [Simon Child](http://thenounproject.com/Simon Child) from the [Noun
Project](http://thenounproject.com) and [Jason
Long](http://twitter.com/jasonlong) from
[git-scm.com](http://git-scm.com/downloads/logos).
