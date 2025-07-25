/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Forms, Text, Switch, TextArea } from "@vencord/types/webpack/common";
import { SettingsComponent } from "./Settings";
import { VesktopSettingsSwitch } from "./VesktopSettingsSwitch";

export const NSFLContentHiderSettings: SettingsComponent = ({ settings }) => {
    const nsflSettings = settings.nsflContentHider ?? { enabled: true, blockedUserIds: "" };

    return (
        <div key="nsfl-content-hider">
            <VesktopSettingsSwitch
                value={nsflSettings.enabled}
                onChange={v => {
                    settings.nsflContentHider = { ...nsflSettings, enabled: v };
                }}
                note="Automatically hides spoilered content (images and videos) from specific users"
            >
                Enable NSFL Content Hider
            </VesktopSettingsSwitch>

            {nsflSettings.enabled && (
                <Forms.FormSection>
                    <Forms.FormTitle tag="h3">Blocked User IDs</Forms.FormTitle>
                    <Forms.FormText>
                        Enter comma-separated user IDs of users whose spoilered content should be automatically hidden.
                        You can find user IDs by enabling Developer Mode and right-clicking on a user.
                    </Forms.FormText>
                    <TextArea
                        value={nsflSettings.blockedUserIds}
                        onChange={v => {
                            settings.nsflContentHider = { ...nsflSettings, blockedUserIds: v };
                        }}
                        placeholder="123456789,987654321,555666777"
                        rows={3}
                    />
                </Forms.FormSection>
            )}
        </div>
    );
}; 