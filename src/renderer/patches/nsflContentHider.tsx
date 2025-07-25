/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy, findStoreLazy } from "@vencord/types/webpack";
import { Forms, Text, Button, Switch, useState } from "@vencord/types/webpack/common";
import { addPatch } from "./shared";
import { Settings } from "renderer/settings";

const MessageStore = findStoreLazy("MessageStore");

// Parse the comma-separated user IDs into a Set for efficient lookup
function getBlockedUserIds(): Set<string> {
    const settings = Settings.store.nsflContentHider;
    console.log("NSFL Content Hider: Current settings:", settings);
    
    if (!settings?.enabled || !settings.blockedUserIds) {
        console.log("NSFL Content Hider: Plugin disabled or no blocked IDs");
        return new Set();
    }
    
    const blockedIds = new Set(
        settings.blockedUserIds
            .split(",")
            .map(id => id.trim())
            .filter(id => id.length > 0)
    );
    
    console.log("NSFL Content Hider: Parsed blocked IDs:", Array.from(blockedIds));
    return blockedIds;
}

// Check if a message should be hidden
function shouldHideMessage(message: any): boolean {
    if (!message?.author?.id) return false;
    
    const blockedIds = getBlockedUserIds();
    console.log("NSFL Content Hider: Checking message from user", message.author.id, "Blocked IDs:", Array.from(blockedIds));
    
    if (!blockedIds.has(message.author.id)) return false;
    
    // Check if message has spoilered content (images or videos)
    const hasSpoileredContent = message.attachments?.some((attachment: any) => 
        attachment.spoiler || 
        attachment.content_type?.startsWith("image/") || 
        attachment.content_type?.startsWith("video/")
    ) || message.embeds?.some((embed: any) => 
        embed.type === "image" || embed.type === "video"
    );
    
    console.log("NSFL Content Hider: Message has spoilered content:", hasSpoileredContent, "Attachments:", message.attachments, "Embeds:", message.embeds);
    
    return hasSpoileredContent;
}

// Test function to manually check a user ID
function testBlockedUser() {
    const testUserId = "1056211735549325362";
    const blockedIds = getBlockedUserIds();
    console.log("NSFL Content Hider: Test - User", testUserId, "is blocked:", blockedIds.has(testUserId));
    console.log("NSFL Content Hider: Test - All blocked IDs:", Array.from(blockedIds));
}

// Create the hidden content component
function HiddenContentComponent({ message, originalContent }: { message: any; originalContent: any }) {
    const [isHidden, setIsHidden] = useState(true);
    
    if (!isHidden) {
        return originalContent;
    }
    
    return (
        <div style={{
            padding: "8px",
            backgroundColor: "var(--background-secondary)",
            border: "1px solid var(--background-tertiary)",
            borderRadius: "4px",
            margin: "4px 0"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
            }}>
                <Text variant="text-sm/semibold" color="header-secondary">
                    NSFL Content Hidden
                </Text>
                <Button
                    size="sm"
                    onClick={() => setIsHidden(false)}
                    style={{ minWidth: "auto", padding: "4px 8px" }}
                >
                    Show Content
                </Button>
            </div>
            <Text variant="text-sm/normal" color="text-muted">
                Content from blocked user has been automatically hidden.
            </Text>
        </div>
    );
}

// Initialize logging
console.log("NSFL Content Hider: Plugin initialized");

// Expose test function globally for manual testing
(window as any).testNSFLBlockedUser = testBlockedUser;

// DOM-based approach to intercept spoiler clicks
function setupSpoilerInterception() {
    // Intercept clicks on spoiler containers
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const spoilerContainer = target.closest('.spoilerContainer__54ab5, .spoilerContent__54ab5');
        
        if (spoilerContainer) {
            console.log("NSFL Content Hider: Spoiler clicked:", spoilerContainer);
            
            // Find the message element
            const messageElement = spoilerContainer.closest('[data-list-item-id*="chat-messages"]');
            if (messageElement) {
                const messageId = messageElement.getAttribute('data-list-item-id')?.split('-').pop();
                console.log("NSFL Content Hider: Found message ID:", messageId);
                
                // Check if this is from a blocked user
                const avatarImg = messageElement.querySelector('.avatar_c19a55');
                const avatarSrc = avatarImg?.getAttribute('src');
                
                // Extract user ID from avatar URL (format: .../avatars/USER_ID/...)
                let userId: string | null = null;
                if (avatarSrc) {
                    const match = avatarSrc.match(/\/avatars\/(\d+)\//);
                    if (match) {
                        userId = match[1];
                    }
                }
                
                console.log("NSFL Content Hider: Found user ID from avatar:", userId);
                
                if (userId) {
                    const blockedIds = getBlockedUserIds();
                    const isBlocked = blockedIds.has(userId);
                    console.log("NSFL Content Hider: User", userId, "is blocked:", isBlocked);
                    
                    if (isBlocked) {
                        console.log("NSFL Content Hider: Blocking spoiler from user:", userId);
                        event.preventDefault();
                        event.stopPropagation();
                        
                        // Replace the spoiler with our hidden content
                        spoilerContainer.innerHTML = `
                            <div style="padding: 8px; background-color: var(--background-secondary); border: 1px solid var(--background-tertiary); border-radius: 4px; margin: 4px 0;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--header-secondary); font-weight: 600; font-size: 14px;">NSFL Content Hidden</span>
                                    <button style="padding: 4px 8px; background: var(--button-secondary-background); border: none; border-radius: 3px; color: var(--text-normal); cursor: pointer;" onclick="this.parentElement.parentElement.parentElement.querySelector('.spoilerInnerContainer__54ab5').style.display='block'; this.parentElement.parentElement.style.display='none';">Show Content</button>
                                </div>
                                <div style="color: var(--text-muted); font-size: 14px;">Content from blocked user has been automatically hidden.</div>
                            </div>
                        `;
                        
                        return false;
                    }
                }
            }
        }
    }, true); // Use capture phase
}

// Set up spoiler interception when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSpoilerInterception);
} else {
    setupSpoilerInterception();
}

// Note: FluxDispatcher approach removed due to import issues
// Will rely on direct patching and DOM interception instead

addPatch({
    patches: [
        // Target spoiler containers specifically
        {
            find: "spoilerContainer",
            replacement: {
                match: /className.*?spoilerContainer.*?children/,
                replace: `$&, onClick: (e) => {
                    const message = arguments[0]?.message;
                    console.log("NSFL Content Hider: Spoiler container clicked, message:", message?.id, message?.author?.id);
                    if (message && $self.shouldHideMessage(message)) {
                        console.log("NSFL Content Hider: Blocking spoiler reveal for message:", message.id);
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }`
            }
        },
        // Target attachment rendering
        {
            find: "attachmentContainer",
            replacement: {
                match: /return(.{1,200}attachmentContainer)/,
                replace: `
                    // Try multiple ways to get the message
                    const message = arguments[0]?.message || arguments[0] || arguments[1]?.message || arguments[1];
                    console.log("NSFL Content Hider: Attachment container rendering:", message?.id, message?.author?.id, "Args:", arguments[0], arguments[1]);
                    if (message && $self.shouldHideMessage(message)) {
                        console.log("NSFL Content Hider: Hiding attachment for message:", message.id);
                        return $self.createHiddenContentComponent(message, arguments[0]);
                    }
                    return$1
                `
            }
        },
        // Target message components more specifically
        {
            find: "1056211735549325362",
            replacement: {
                match: /return(.{1,50})/,
                replace: `
                    console.log("NSFL Content Hider: Found target user ID in render! Args:", arguments);
                    const message = arguments[0]?.message || arguments[0] || arguments[1]?.message || arguments[1];
                    if (message && $self.shouldHideMessage(message)) {
                        console.log("NSFL Content Hider: Hiding content for target user:", message.id);
                        return $self.createHiddenContentComponent(message, arguments[0]);
                    }
                    return$1
                `
            }
        },
        // Fallback: Target message rendering more broadly
        {
            find: ".message",
            replacement: {
                match: /return(.{1,100}message)/,
                replace: `
                    const message = arguments[0]?.message || arguments[0] || arguments[1]?.message || arguments[1];
                    if (message?.author?.id === "1056211735549325362") {
                        console.log("NSFL Content Hider: Found target user message:", message?.id, message?.author?.id);
                        if ($self.shouldHideMessage(message)) {
                            console.log("NSFL Content Hider: Hiding message:", message.id);
                            return $self.createHiddenContentComponent(message, arguments[0]);
                        }
                    }
                    return$1
                `
            }
        }
    ],

    shouldHideMessage,
    createHiddenContentComponent: (message: any, originalContent: any) => 
        <HiddenContentComponent message={message} originalContent={originalContent} />
}); 