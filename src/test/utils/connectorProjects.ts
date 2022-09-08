/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the MIT license found in the
 * LICENSE file in the root of this projects source tree.
 */

import * as chai from "chai";
import * as fs from "fs";
import * as path from "path";

import { InputBox, Key, Workbench } from "vscode-extension-tester";

import { delay } from "../../utils/pids";

const expect = chai.expect;

export module ConnectorProjects {
    export async function createOneNewExtensionProject(
        workbench: Workbench,
        newExtensionName: string,
        targetDirectory: string,
    ): Promise<void> {
        await workbench.executeCommand("power query: create an extension project");

        // InputBox.
        const inputBox = await InputBox.create();
        await inputBox.setText(newExtensionName);
        await inputBox.sendKeys(Key.ENTER);
        await delay(250);
        await inputBox.sendKeys(Key.chord(Key.CONTROL, "A"));
        await delay(250);
        await inputBox.sendKeys(targetDirectory);
        await inputBox.sendKeys(Key.ENTER);

        await delay(5e3);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function getVscSettings(newExtensionName: string, targetDirectory: string): any | undefined {
        const settingPath = path.join(targetDirectory, newExtensionName, ".vscode", "settings.json");

        const settingJsonContent = fs.readFileSync(settingPath, { encoding: "utf8" });

        return JSON.parse(settingJsonContent);
    }

    export function assertNewlyCreatedWorkspaceSettingsIntact(newExtensionName: string, targetDirectory: string): void {
        const currentSdkSettings = ConnectorProjects.getVscSettings(newExtensionName, targetDirectory);

        expect(currentSdkSettings["powerquery.sdk.pqtest.queryFile"]).eq(
            "${workspaceFolder}\\${workspaceFolderBasename}.query.pq",
        );

        expect(currentSdkSettings["powerquery.sdk.pqtest.extension"]).eq(
            "${workspaceFolder}\\bin\\AnyCPU\\Debug\\${workspaceFolderBasename}.mez",
        );

        // assert we got SDK populated correctly when needed
        if (currentSdkSettings["powerquery.general.mode"]) {
            expect(currentSdkSettings["powerquery.general.mode"]).eq("SDK");
        }
    }
}