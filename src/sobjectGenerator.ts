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

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Connection } from '@salesforce/core';
import type { DescribeSObjectResult, Field } from '@jsforce/jsforce-node';

export type SObjectCategory = 'ALL' | 'CUSTOM' | 'STANDARD';

export type SObjectGeneratorOptions = {
  connection: Connection;
  category: SObjectCategory;
  outputDir: string;
  onProgress?: (message: string) => void;
};

export type GenerateResult = {
  standardObjects: number;
  customObjects: number;
  totalObjects: number;
  cancelled: boolean;
};

/**
 * Generates faux Apex classes for SObjects to enable code completion
 */
export class SObjectGenerator {
  private connection: Connection;
  private category: SObjectCategory;
  private outputDir: string;
  private onProgress?: (message: string) => void;

  public constructor(options: SObjectGeneratorOptions) {
    this.connection = options.connection;
    this.category = options.category;
    this.outputDir = options.outputDir;
    this.onProgress = options.onProgress;
  }

  /**
   * Map Salesforce field type to Apex type
   */
  private static mapToApexType(field: Field): string {
    const stringTypes = [
      'id',
      'string',
      'email',
      'phone',
      'url',
      'textarea',
      'picklist',
      'multipicklist',
      'combobox',
      'encryptedstring',
    ];
    const doubleTypes = ['double', 'currency', 'percent'];

    if (stringTypes.includes(field.type)) {
      return 'String';
    }

    if (doubleTypes.includes(field.type)) {
      return 'Double';
    }

    const typeMap: Record<string, string> = {
      int: 'Integer',
      boolean: 'Boolean',
      date: 'Date',
      datetime: 'Datetime',
      time: 'Time',
      location: 'Location',
      address: 'Address',
      base64: 'Blob',
    };

    if (field.type === 'reference') {
      return field.referenceTo && field.referenceTo.length > 0 ? field.referenceTo[0] : 'Id';
    }

    return typeMap[field.type] ?? 'Object';
  }

  /**
   * Generate Apex field declaration
   */
  private static generateFieldDeclaration(field: Field): string {
    const apexType = SObjectGenerator.mapToApexType(field);
    const comment = field.label ? `    // ${field.label}` : '';

    return `${comment ? comment + '\n' : ''}    global ${apexType} ${field.name};`;
  }

  /**
   * Generate Apex class content for an SObject
   */
  private static generateClassContent(describe: DescribeSObjectResult): string {
    const lines: string[] = [];

    // Class header
    lines.push('// This file is generated as an Apex representation of the');
    lines.push(`//     ${describe.label}`);
    lines.push('// standard object in your org.');
    lines.push('// This file is used for language services by the Apex Language Server.');
    lines.push('');
    lines.push(`global class ${describe.name} {`);

    // Add fields
    if (describe.fields) {
      for (const field of describe.fields) {
        lines.push(SObjectGenerator.generateFieldDeclaration(field));
      }
    }

    // Add constructor
    lines.push('');
    lines.push(`    global ${describe.name}() { }`);

    // Close class
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate SObject definitions
   */
  public async generate(): Promise<GenerateResult> {
    this.progress('Fetching SObject list from org...');

    // Get list of all SObjects
    const describeGlobal = await this.connection.describeGlobal();
    let sobjects = describeGlobal.sobjects;

    // Filter based on category
    if (this.category === 'CUSTOM') {
      sobjects = sobjects.filter((obj) => obj.custom);
    } else if (this.category === 'STANDARD') {
      sobjects = sobjects.filter((obj) => !obj.custom);
    }

    this.progress(`Found ${sobjects.length} SObjects to process`);

    // Create output directories
    const standardDir = path.join(this.outputDir, 'tools', 'sobjects', 'standardObjects');
    const customDir = path.join(this.outputDir, 'tools', 'sobjects', 'customObjects');

    await fs.mkdir(standardDir, { recursive: true });
    await fs.mkdir(customDir, { recursive: true });

    let standardCount = 0;
    let customCount = 0;

    // Generate class for each SObject
    const results = await Promise.allSettled(
      sobjects.map(async (sobject) => {
        this.progress(`Processing ${sobject.name}...`);

        // Describe the SObject to get its fields
        const describe = await this.connection.describe(sobject.name);

        // Generate the faux class content
        const classContent = SObjectGenerator.generateClassContent(describe);

        // Determine output directory
        const targetDir = sobject.custom ? customDir : standardDir;
        const filePath = path.join(targetDir, `${sobject.name}.cls`);

        // Write the file
        await fs.writeFile(filePath, classContent, 'utf8');

        return { custom: sobject.custom, name: sobject.name };
      })
    );

    // Count results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.custom) {
          customCount++;
        } else {
          standardCount++;
        }
      } else {
        this.progress(`Warning: Failed to process SObject: ${result.reason}`);
      }
    }

    return {
      standardObjects: standardCount,
      customObjects: customCount,
      totalObjects: standardCount + customCount,
      cancelled: false,
    };
  }

  /**
   * Report progress
   */
  private progress(message: string): void {
    if (this.onProgress) {
      this.onProgress(message);
    }
  }
}

/**
 * Generate SObject definitions
 */
export async function generateSObjects(options: SObjectGeneratorOptions): Promise<GenerateResult> {
  const generator = new SObjectGenerator(options);
  return generator.generate();
}
