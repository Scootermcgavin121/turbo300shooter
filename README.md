# Baby Turbo vs. The Trenches

A retro-style space shooter game where Baby Turbo battles through the crypto trenches!

## Play the Game

[Play Baby Turbo vs. The Trenches](https://scootermcgavin121.github.io/turbo300shooter/)

## Game Features

- Classic space shooter gameplay with crypto-themed enemies
- Power-ups: Triple Shot, Shield, Speed Boost, Bomb, and Jeet Stomper
- Combo system for higher scores
- Global leaderboard to compete with other players
- Retro arcade cabinet styling

## Controls

### Keyboard
- **Left/Right Arrow Keys**: Move Baby Turbo
- **Space**: Fire
- **Enter**: Confirm/Restart (on game over screen)

### Mobile/Touch
- **Left/Right Buttons**: Move Baby Turbo
- **Fire Button**: Shoot
- **Tap Screen**: Confirm/Restart (on game over screen)

## Setup Instructions

1. Clone this repository
2. Create a `supabase-config.js` file with your Supabase credentials:
   ```javascript
   const supabaseConfig = {
     supabaseUrl: "YOUR_SUPABASE_URL",
     supabaseKey: "YOUR_SUPABASE_ANON_KEY"
   };
   ```
3. Open `index.html` in your browser to play locally

## Leaderboard Setup

The game uses Supabase for the leaderboard functionality. To set up your own leaderboard:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the following SQL in the SQL editor:
   ```sql
   CREATE TABLE leaderboard (
     id SERIAL PRIMARY KEY,
     player_name VARCHAR NOT NULL,
     score INTEGER NOT NULL,
     game_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
   ```
4. Set up Row Level Security policies as needed
5. Update the `supabase-config.js` file with your project credentials

## Credits

Created by Scooter 