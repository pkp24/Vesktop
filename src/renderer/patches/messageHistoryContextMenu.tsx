/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addContextMenuPatch } from "@vencord/types/api/ContextMenu";
import { Menu } from "@vencord/types/webpack/common";

// Track if we've already processed a menu to prevent duplicate processing
const processedMenus = new WeakSet();

// Helper function to recursively search for the Remove Message History item
function findRemoveHistoryItem(items: any[]): { item: any; parentIndex: number; itemIndex: number } | null {
    for (let parentIndex = 0; parentIndex < items.length; parentIndex++) {
        const parent = items[parentIndex];
        
        // Check if this parent item itself is the Remove Message History item
        if (parent?.props?.id === "ml-remove-history" || 
            parent?.props?.label === "Remove Message History" ||
            parent?.key === "ml-remove-history") {
            return { item: parent, parentIndex, itemIndex: -1 };
        }
        
        // Check children arrays
        if (parent?.props?.children && Array.isArray(parent.props.children)) {
            for (let itemIndex = 0; itemIndex < parent.props.children.length; itemIndex++) {
                const child = parent.props.children[itemIndex];
                if (child?.props?.id === "ml-remove-history" || 
                    child?.props?.label === "Remove Message History" ||
                    child?.key === "ml-remove-history") {
                    return { item: child, parentIndex, itemIndex };
                }
            }
        }
    }
    return null;
}

// Function to move the Remove Message History item to the top
function moveRemoveHistoryToTop(children: any[]) {
    // Check if we've already processed this menu
    if (processedMenus.has(children)) {
        return true;
    }
    
    // Find the Remove Message History item
    const result = findRemoveHistoryItem(children);
    
    if (result) {
        const { item, parentIndex, itemIndex } = result;
        
        // Check if the item is already at the top
        if (parentIndex === 0 && itemIndex === -1) {
            // Check if there's already a separator after the first item
            if (children.length > 1 && children[1]?.type === Menu.MenuSeparator) {
                processedMenus.add(children);
                return true;
            }
        }
        
        if (itemIndex === -1) {
            // The item is a direct child of the main menu
            // Remove it from its current position
            const [removeHistoryItem] = children.splice(parentIndex, 1);
            
            // Insert it at the beginning of the menu
            children.unshift(removeHistoryItem);
            
            // Add a separator after the moved item if there are other items and no separator already exists
            if (children.length > 1 && children[1]?.type !== Menu.MenuSeparator) {
                children.splice(1, 0, <Menu.MenuSeparator />);
            }
        } else {
            // The item is in a nested children array
            const parent = children[parentIndex];
            if (parent?.props?.children) {
                const parentChildren = parent.props.children;
                
                // Remove the item from its current position
                const [removeHistoryItem] = parentChildren.splice(itemIndex, 1);
                
                // Insert it at the beginning of the main menu
                children.unshift(removeHistoryItem);
                
                // Add a separator after the moved item if there are other items and no separator already exists
                if (children.length > 1 && children[1]?.type !== Menu.MenuSeparator) {
                    children.splice(1, 0, <Menu.MenuSeparator />);
                }
            }
        }
        
        // Mark this menu as processed
        processedMenus.add(children);
        
        return true;
    }
    
    return false;
}

// Intercept the MessageLogger plugin's context menu function
function interceptMessageLogger() {
    // Check if Message History plugin is active
    const messageHistoryPlugin = Vencord.Plugins.plugins["MessageHistory"] || 
                                Vencord.Plugins.plugins["messageHistory"] ||
                                Vencord.Plugins.plugins["Message Logger"] ||
                                Vencord.Plugins.plugins["MessageLogger"];
    
    if (!messageHistoryPlugin) {
        return;
    }
    
    // Check if the plugin has context menus
    if (messageHistoryPlugin?.contextMenus?.message) {
        // Store the original function
        const originalMessageFunction = messageHistoryPlugin.contextMenus.message;
        
        // Replace it with our modified version
        messageHistoryPlugin.contextMenus.message = function(children: any[], ...args: any[]) {
            // Call the original function first
            const result = originalMessageFunction.call(this, children, ...args);
            
            // Then move the Remove Message History item to the top
            moveRemoveHistoryToTop(children);
            
            return result;
        };
    }
}

// Try to intercept the MessageLogger plugin immediately
interceptMessageLogger();

// Also try again after a delay in case the plugin loads later
setTimeout(interceptMessageLogger, 1000);
setTimeout(interceptMessageLogger, 2000);

// Fallback: also use the traditional context menu patch as a backup
addContextMenuPatch("message", children => {
    // Only run this if we haven't already intercepted the MessageLogger plugin
    const messageHistoryPlugin = Vencord.Plugins.plugins["MessageHistory"] || 
                                Vencord.Plugins.plugins["messageHistory"] ||
                                Vencord.Plugins.plugins["Message Logger"] ||
                                Vencord.Plugins.plugins["MessageLogger"];
    
    if (messageHistoryPlugin?.contextMenus?.message) {
        // Try to move the item after a delay
        setTimeout(() => {
            moveRemoveHistoryToTop(children);
        }, 50);
    }
}); 