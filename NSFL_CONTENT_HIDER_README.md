# NSFL Content Hider Plugin for Vesktop

This plugin automatically hides spoilered content (images and videos) from specific users in Discord. It's designed to help you avoid potentially disturbing content from users you've identified as posting such material.

## Features

- **Automatic Content Hiding**: Automatically hides spoilered images and videos from specified users
- **User ID Management**: Enter comma-separated user IDs to block content from specific users
- **Easy Settings Interface**: Simple settings panel integrated into Vesktop's settings
- **Toggle Functionality**: Enable/disable the plugin as needed

## How to Use

### 1. Access Settings
1. Open Vesktop
2. Go to Settings (gear icon)
3. Navigate to the "Content Filtering" section
4. Find "NSFL Content Hider"

### 2. Configure the Plugin
1. **Enable the Plugin**: Toggle the "Enable NSFL Content Hider" switch
2. **Add User IDs**: In the "Blocked User IDs" text area, enter user IDs separated by commas
   - Example: `123456789,987654321,555666777`
   - You can add or remove user IDs at any time

### 3. Finding User IDs
To find a user's ID:
1. Enable Developer Mode in Discord:
   - Go to User Settings > Advanced
   - Turn on "Developer Mode"
2. Right-click on the user's name or avatar
3. Click "Copy User ID"
4. Paste the ID into the plugin settings

## How It Works

The plugin works by:
1. **Monitoring Messages**: It checks all incoming messages for content from blocked users
2. **Content Detection**: It identifies messages containing images or videos
3. **Automatic Hiding**: When a blocked user posts spoilered content, it's automatically hidden behind a "NSFL Content Hidden" message
4. **User Control**: You can still view the content by clicking on the hidden message

## Technical Details

- **File Location**: `src/renderer/patches/nsflContentHider.tsx`
- **Settings Storage**: Settings are stored in Vesktop's main settings file
- **Content Types**: Currently detects images and videos (both attachments and embeds)
- **Performance**: Uses efficient Set-based lookups for user ID checking

## Limitations

- Only works with spoilered content (images and videos)
- Requires user IDs to be manually entered
- Content is hidden but not permanently blocked (can still be viewed)
- Only works in Vesktop (not in regular Discord web/app)

## Future Enhancements

Potential improvements that could be added:
- Context menu integration for easy user blocking
- Support for other content types
- Whitelist functionality
- More granular content filtering options
- Integration with Discord's built-in user blocking

## Troubleshooting

**Plugin not working?**
1. Make sure the plugin is enabled in settings
2. Verify user IDs are correctly formatted (comma-separated, no spaces)
3. Check that the user has actually posted spoilered content
4. Restart Vesktop if needed

**Settings not saving?**
1. Check that Vesktop has write permissions to its settings directory
2. Try restarting Vesktop
3. Check the console for any error messages

## Contributing

This plugin is part of the Vesktop project. To contribute:
1. Fork the Vesktop repository
2. Make your changes to the plugin
3. Test thoroughly
4. Submit a pull request

## License

This plugin is part of Vesktop and follows the same GPL-3.0-or-later license. 