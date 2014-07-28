var Gitwar = require( 'gitwar' );
var _ = require( 'lodash-node' );
var readline = require( 'readline' );
var colors = require( 'colors' );

var print = function( message, arg ) {
    var scriptItem = Gitfight.script[ message ];

    if ( typeof scriptItem == 'function' ) {
        scriptItem = scriptItem( arg );
    }

    console.log( scriptItem );
};

var Gitfight = {
    init: function() {
        Gitwar.init()
        .then( function() {
            return Gitfight.setState();
        })
        .then( function() {
            return Gitwar.head()
        })
        .then( function( head ) {
            if ( !Gitwar.me ) {
                print( 'userMissing' );
                process.exit();
            }

            if ( Gitfight.score.me <= 0 ) {
                print( 'theyWin' );
                process.exit();
            } else if ( Gitfight.score.opponent <= 0 ) {
                print( 'youWin' );

                if ( head.user != Gitwar.me ) {
                    Gitwar.addLog( turn )
                    .then( function() {
                        print( 'wrapUp' );

                        Gitwar.sync();
                        process.exit();
                    });
                } else {
                    print( 'wrapUp' );

                    Gitwar.sync()
                    .then( function() {
                        process.exit();
                    });
                }
            } else {
                if ( head.user == Gitwar.me ) {
                    return Gitfight.wait();
                } else {
                    return Gitfight.takeTurn();
                }
            }
        });
    },

    score: {
        me: 100,
        opponent: 100
    },

    script: {
        turn: 'How would you like to attack?\n' +
            'H - Haymaker, U - Uppercut\n' +
            'L - Left Hook, J - Jab: ',
        syntaxError: '\nIncorrect syntax. Please try again.\n',
        userMissing: 'Your gitconfig username did not match any names in user.json. Game cannot start.',
        wrapUp: 'Wrapping up...',
        wait: function() {
            return ( Gitwar.opponent + '\'s' ).red + ' turn. Waiting...';
        },
        recap: function( turn ) {
            if ( turn.hitPoints == 0 ) {
                return 'MISS!';
            } else {
                // return hit
                return ( turn.user == Gitwar.me ? turn.user.green : turn.user.red ) + ' threw a ' + Gitfight.actions[ turn.action ] + ' and landed ' + turn.hitPoints + ' points worth of damage!';
            }
        },
        score: function() {
            return 'SCORE' + '\n' +
                Gitwar.me.green + ': ' + Gitfight.score.me + '\n' +
                Gitwar.opponent.red + ': ' + Gitfight.score.opponent;
        },
        youWin: function() {
            return ( 'You win!' ).green + ' Congratulations. Reset game or branch to play again.';
        },
        theyWin: function() {
            return Gitwar.opponent.red + ' wins! Sorry. Better luck next time.';
        }
    },

    setState: function() {
        Gitwar.logs().then( function( commits ) {
            _.each( commits, function( commit, i ) {
                // Validate
                if ( commits[ i - 1 ] && commit.user == commits[ i - 1 ].user ) {
                    // ERROR - need to take turns
                    throw "Invalid log... You may need to restart your game.";
                }

                if ( commit.user == Gitwar.me ) {
                    Gitfight.score.opponent -= commit.hitPoints;
                } else {
                    Gitfight.score.me -= commit.hitPoints;
                }
            }).reverse();
        })
        .catch( function( err ) {
            console.log( err );
            process.exit();
        });
    },

    hit: function( percentage ) {
        return Math.random() < ( percentage / 100 );
    },

    actions: {
        'H': 'HAYMAKER',
        'U': 'UPPERCUT',
        'L': 'LEFT HOOK',
        'J': 'JAB'
    },

    moves: {
        'H': function() {
            // Haymaker
            // 40% chance
            // 30-35 hit points
            var hit = Gitfight.hit( '40' );
            if ( hit ) {
                return ( Math.floor( Math.random() * 100 ) % 6 ) + 30;
            }
            return 0;
        },
        'U': function() {
            // Uppercut
            // 60% chance
            // 20-25 hit points
            var hit = Gitfight.hit( '60' );
            if ( hit ) {
                return ( Math.floor( Math.random() * 100 ) % 6 ) + 20;
            }
            return 0;
        },
        'L': function() {
            // Left Hook
            // 70% chance
            // 15-20 hit points
            var hit = Gitfight.hit( '70' );
            if ( hit ) {
                return ( Math.floor( Math.random() * 100 ) % 6 ) + 15;
            }
            return 0;
        },
        'J': function() {
            // Jab
            // 80% chance
            // 8-10 hit points
            var hit = Gitfight.hit( '80' );
            if ( hit ) {
                return ( Math.floor( Math.random() * 100 ) % 3 ) + 8;
            }
            return 0;
        }
    },

    wait: function() {
        print( 'wait' );

        Gitwar.sync()
        .then( function() {
            return Gitwar.poll( Gitfight.takeTurn );
        });
    },

    takeTurn: function( lastTurn ) {
        if ( lastTurn ) {
            print( 'recap', lastTurn );

            Gitfight.score.me -= lastTurn.hitPoints;
            if ( Gitfight.score.me <= 0 ) {
                print( 'theyWin' );
                process.exit();
            }
        }

        print( 'score' );

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // prompt user for move
        rl.question( '\n' + Gitfight.script.turn, function( action ) {
            if ( !Gitfight.moves[ action ] ) {
                print( 'syntaxError' );
                rl.close();
                Gitfight.takeTurn();
            }

            var turn = {
                user: Gitwar.me,
                action: action,
                hitPoints: Gitfight.moves[ action ]()
            };

            Gitfight.score.opponent -= turn.hitPoints;

            print( 'recap', turn );

            if ( Gitfight.score.opponent <= 0 ) {
                print( 'youWin' );

                Gitwar.addLog( turn )
                .then( function() {
                    print( 'wrapUp' );

                    return Gitwar.sync();
                })
                .then( function() {
                    rl.close();
                    process.exit();
                });
            } else {
                Gitwar.addLog( turn )
                .then( function() {
                    return Gitfight.wait();
                });
            }

            rl.close();
        });

    }
};

Gitfight.init();
