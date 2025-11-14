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
import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import Refresh from '../../../../src/commands/sobject/definitions/refresh.js';

describe('sobject definitions refresh', () => {
  const $$ = new TestContext();

  afterEach(() => {
    $$.restore();
  });

  it('should have correct flags', () => {
    const flags = Refresh.flags;
    expect(flags['sobject-category']).to.exist;
    expect(flags['sobject-category'].options).to.deep.equal(['all', 'custom', 'standard']);
    expect(flags['sobject-category'].default).to.equal('all');
  });

  it('should have api-version flag', () => {
    const flags = Refresh.flags;
    expect(flags['api-version']).to.exist;
  });

  it('should have target-org flag', () => {
    const flags = Refresh.flags;
    expect(flags['target-org']).to.exist;
  });

  it('should require a project', () => {
    expect(Refresh.requiresProject).to.be.true;
  });

  it('should have correct command metadata', () => {
    expect(Refresh.summary).to.exist;
    expect(Refresh.description).to.exist;
    expect(Refresh.examples).to.exist;
  });
});
