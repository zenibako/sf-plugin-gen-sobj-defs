# summary

Refresh SObject definitions for your org.

# description

Generates or refreshes local SObject definitions (faux classes) for code completion in your IDE. These definitions help with IntelliSense and type checking when working with Salesforce objects in your code.

You can choose to refresh all SObjects, only custom objects, or only standard objects. The command connects to your default org and fetches the latest SObject metadata.

# examples

- Refresh all SObject definitions:

  <%= config.bin %> <%= command.id %>

- Refresh only custom SObject definitions:

  <%= config.bin %> <%= command.id %> --sobject-category custom

- Refresh only standard SObject definitions:

  <%= config.bin %> <%= command.id %> --sobject-category standard

# flags.target-org.summary

Username or alias of the target org.

# flags.sobject-category.summary

The category of SObjects to refresh.

# flags.sobject-category.description

Specify which category of SObjects to refresh: all, custom, or standard. Default is all.

# flags.api-version.summary

Override the API version used for the connection.

# flags.api-version.description

Use a specific API version when connecting to the org. If not specified, uses the project's sourceApiVersion or the org's default.

# info.refreshing

Refreshing SObject definitions...

# info.success

Successfully refreshed %s SObject definition(s): %s standard, %s custom

# error.already-active

An SObject refresh is already in progress. Please wait for it to complete.

# error.refresh-failed

Failed to refresh SObject definitions: %s

# prompt.category

Select SObject category to refresh

# choice.all

All SObjects

# choice.custom

Custom SObjects

# choice.standard

Standard SObjects
