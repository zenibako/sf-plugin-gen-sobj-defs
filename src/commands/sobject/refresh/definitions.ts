/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, AuthInfo, Connection } from '@salesforce/core';
import { type SObjectCategory, generateSObjects } from '../../../sobjectGenerator.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@zenibako/plugin-gen-sobj-defs', 'sobject.refresh.definitions');

export type DefinitionsResult = {
  success: boolean;
  standardObjects: number;
  customObjects: number;
  totalObjects: number;
  cancelled: boolean;
};

export default class Definitions extends SfCommand<DefinitionsResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      summary: messages.getMessage('flags.target-org.summary'),
      required: false,
    }),
    'sobject-category': Flags.string({
      summary: messages.getMessage('flags.sobject-category.summary'),
      description: messages.getMessage('flags.sobject-category.description'),
      options: ['all', 'custom', 'standard'],
      default: 'all',
    }),
    'api-version': Flags.orgApiVersion({
      summary: messages.getMessage('flags.api-version.summary'),
      description: messages.getMessage('flags.api-version.description'),
    }),
  };

  private static isActive = false;

  public async run(): Promise<DefinitionsResult> {
    const { flags } = await this.parse(Definitions);

    // Check if a refresh is already active
    if (Definitions.isActive) {
      throw messages.createError('error.already-active');
    }

    Definitions.isActive = true;

    try {
      // Convert flag to SObjectCategory type
      const category: SObjectCategory = flags['sobject-category'].toUpperCase() as SObjectCategory;

      this.spinner.start(messages.getMessage('info.refreshing'));

      // Get connection
      const org = flags['target-org'];
      if (!org) {
        throw messages.createError('error.refresh-failed', [
          'No target org specified. Use --target-org or set a default org.',
        ]);
      }

      const authInfo = await AuthInfo.create({ username: org.getUsername() });
      const connection = await Connection.create({
        authInfo,
        ...(flags['api-version'] && {
          connectionOptions: { version: flags['api-version'] },
        }),
      });

      // Get project path
      const projectPath = this.project?.getPath();
      if (!projectPath) {
        throw messages.createError('error.refresh-failed', ['No project path found']);
      }

      // Call the sobject generator
      const result = await generateSObjects({
        connection,
        category,
        outputDir: projectPath,
        onProgress: (message: string) => {
          this.log(message);
        },
      });

      this.spinner.stop();

      const { standardObjects, customObjects, totalObjects } = result;

      if (!result.cancelled) {
        this.log(
          messages.getMessage('info.success', [String(totalObjects), String(standardObjects), String(customObjects)])
        );
      }

      return {
        success: !result.cancelled,
        standardObjects,
        customObjects,
        totalObjects,
        cancelled: result.cancelled,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw messages.createError('error.refresh-failed', [errorMessage]);
    } finally {
      Definitions.isActive = false;
      this.spinner.stop();
    }
  }
}
