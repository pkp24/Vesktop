# NSFL Content Hider

A Vencord plugin that automatically hides spoilered content from specific users.

## Features

- Automatically hides spoilered images and videos from specified users
- Configurable list of blocked user IDs
- Click-to-reveal functionality for hidden content
- Clean, Discord-themed UI

## Installation

1. Download the `index.tsx` file from this repository
2. Place it in your Vencord plugins folder:
   - **Windows**: `%APPDATA%\Vencord\plugins\`
   - **macOS**: `~/Library/Application Support/Vencord/plugins/`
   - **Linux**: `~/.config/Vencord/plugins/`
3. Restart Discord
4. Go to Vencord Settings → Plugins and enable "NSFL Content Hider"

## Usage

1. Enable the plugin in Vencord Settings
2. Enter the user IDs you want to block (comma-separated)
3. The plugin will automatically hide spoilered content from those users
4. Click "Show Content" to reveal hidden content when needed

## How to Find User IDs

1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode
2. Right-click on a user's name or avatar
3. Click "Copy User ID"
4. Paste the ID into the plugin settings

## Settings

- **Enable NSFL Content Hider**: Toggle the plugin on/off
- **Blocked User IDs**: Comma-separated list of user IDs to hide content from

## Example

If you want to block users with IDs `123456789` and `987654321`, enter:
```
123456789,987654321
```

## Technical Details

The plugin works by:
1. Intercepting message rendering
2. Checking if the message author is in the blocked list
3. Checking if the message contains spoilered images/videos
4. Replacing the content with a hidden content component
5. Providing a button to reveal the original content

## License

GPL-3.0-or-later 