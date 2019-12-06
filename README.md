# jq-paginator

Somewhat light jQuery pagination plugin thing.
Inspired by other pagination libraries, but hopefully a bit simpler.

## Usage

Pass `options` as an object of options to initialise a paginator.

- `data`: _Required_ Function, or array of data.
- `itemsPerPage`: Number items per page of results.
- `buttonText`: Array of two values, corresponding to each of `prev` and `next` buttons text values.
- `showNumbers`: Bool has numbers to click to page.
- `showButtons`: Bool has previous/next buttons.
- `showInput`: Bool has an input to type in.
- `numberMargin`: Number of numbers to show surrounding active page.
- `render`: _Required_ Function to use for rendering data. (Required)

When initialising, at least one of the options of `showNumbers`, `showButtons`, and `showInput` should be given. This is because without one of these, you don't have any element to interact with the paginator.

Options can also be one of the following:

- `"destroy"`: Removes paginator and all events.
- `"reload"`: Destroys paginator and reinitialises.
- `"goto"`: Go to a specified page number. (In case you want something custom)
- `"getPage"`: Get the current page number. (Will only use the first found paginator in selector)

## Events

The paginator has several events that under certain circumstances.

Firstly, `before-paging` is fired on the pagination element when a page is attempted navigation to.

Then, `after-paging` is fired on the pagination element after the render function given is called. (Triggered in the `done` callback.)

Additionally, `destroy-paging` is fired when a pagination element is destroyed via `$('.selector').jqpagination('destroy')`. This can be used to cleanup content generated from render functions.
