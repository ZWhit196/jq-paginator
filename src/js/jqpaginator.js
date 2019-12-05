/**
 * Translate the weird object thing I made before into
 * a nicer jQuery plugin that trumps the one I found 
 * on the internet.
 * 
 * For creation:
 * `options` is an object of options.
 *   `data` Function, or array of data.
 *   `itemsPerPage` Number items per page of results.
 *   `buttonText` Array of two values, corresponding to each of `next` and `prev` buttons text values.
 *   `showNumbers` Bool has numbers to click to page.
 *   `showButtons` Bool has previous/next buttons.
 *   `showInput` Bool has an input to type in.
 *   `numberMargin` Number of numbers to show surrounding active page.
 *   `render` Function to use for rendering data.
 *   `beforePaging` Function to call before requesting data.
 *   `afterPaging` Function to call after requesting data.
 */
(function($) {
    
    var fn = {
        // util
        bind: function(event, element, func) {
            // Binding events
            element.on(event, func);
        },
        // ajax related
        done: function(dataArray, total) {
            /**
             * Passed to `data` function, and accepts a 
             * `dataArray` as the data returned from the
             * `data` function, and the number `total` of 
             * total data items.
             */
        },
        // construction
        getPageNums: function() {},
        buildBar: function() {},
        createNumber: function(num, activeNum) {
            var $el = $("<li class=\"page\">" + num + "</li>");  
            if (num == activeNum) $el.addClass("active");
            return $el;
        },
    };

    var opt = {  // Default options
        data: null,
        itemsPerPage: 10,
        buttonText: ["<<", ">>"],
        showNumbers: true,
        showButtons: true,
        showInput: true,
        numberMargin: 2,
        render: null,
        beforePaging: null,
        afterPaging: null,
    };

    $.fn.paginator = function(options) {
        
    };

})(jQuery);



// old stuff i had for a thing
function Paginator(parent, options, runOnInit) {
    /**
     * Instantiate a Paginator Object.
     * 
     * The Paginator will NOT automatically get the first page,
     * call `.load()` to start and get the first page.
     * 
     * `parent` is a string selector to get an element.
     * `options` is an object of options.
     *   `url` String url.
     *   `totalKey` String key to get the total number of items across all pages in response.
     *   `dataKey` String key to get data from response.
     *   `itemsPerPage` Number items per page of results.
     *   `ajaxData` Object or function returning an object.
     *   `buttonText` Array of two values, corresponding to each of `next` and `prev` buttons text values.
     *   `hasNumbers` Bool has numbers to click to page.
     *   `hasPrevNext` Bool has previous/next buttons.
     *   `hasInput` Bool has an input to type in.
     *   `numberMargin` Number of numbers to show surrounding active page.
     *   `render` Function to use after requesting data, passed response json & `Paginator` Object.
     *   `beforePaging` Function to call before requesting data, passed `Paginator` object.
     *   `afterPaging` Function to call after requesting data, passed `Paginator` object.
     */
    // check parent
    if (!this.isStr(parent))
        throw Error("Parent identifier must be string type.");
    if ($(parent).length == 0)
        throw Error("Cannot instantiate pagination on element that doesn't exist.");
    this.parent = parent;
    this.currentPage = 1;
    this.maxPage = 1;
    this.lastKnownTotal = 1;
    this.currentData = null;
    // options
    this.options = {};
    this.options.url = (this.isStr(options.url)) ? options.url : "";
    this.options.totalKey = (this.isStr(options.totalKey)) ? options.totalKey : "total";
    this.options.dataKey = (this.isStr(options.dataKey)) ? options.dataKey : "data";
    this.options.itemsPerPage = (this.isNum(options.itemsPerPage)) ? options.itemsPerPage : 10;
    this.options.ajaxData = (!this.isUndef(options.ajaxData)) ? options.ajaxData : null;
    this.options.hasNumbers = (!this.isUndef(options.hasNumbers)) ? !!options.hasNumbers : true;
    this.options.hasPrevNext = (!this.isUndef(options.hasPrevNext)) ? !!options.hasPrevNext : true;
    this.options.hasInput = (!this.isUndef(options.hasInput)) ? !!options.hasInput : true;
    this.options.numberMargin = (this.isNum(options.numberMargin)) ? options.numberMargin : 2;
    this.options.buttonText = (this.isArr(options.buttonText) && options.buttonText.length == 2) ? options.buttonText : ["<<",">>"];
    this.options.render = options.render;
    this.options.beforePaging = options.beforePaging;
    this.options.afterPaging = options.afterPaging;
    if (this.options.url === "")
        throw Error("Cannot have an empty url for request.");
    if (!this.isFunc(this.options.render))
        throw Error("Render function must be given to handle output.");
    // setup 
    this.setupBar();
    this.buttonEvents();
    this.inputEvent();

    // run on initialise
    if (runOnInit)
        this.goto(1);
    else
        this.print("Paginator: Prepared & waiting, use .goto() to load data.");
}
Paginator.prototype = Object.assign(Paginator.prototype, {
    // Run once setups
    setupBar: function() {
        /**
         * Create the content of the paginator.
         */
        var $parent = $(this.parent), btnText = this.options.buttonText;

        // Base containers
        $parent.empty().append("<div class=\"pagination-bar\"></div><div class=\"pagination-input\"></div>");
        // Add input
        $parent.find(".pagination-input").append("<input type=\"number\" min=\"1\"/><button>Go</button>");
        // Add prev/next && list for numbers
        $parent.find(".pagination-bar").append("<button class=\"prev\">" + btnText[0] + "</button>");
        $parent.find(".pagination-bar").append("<ul></ul>");
        $parent.find(".pagination-bar").append("<button class=\"next\">" + btnText[1] + "</button>");
        // No input wanted
        if (!this.options.hasInput)
            $parent.find(".pagination-input").hide();
        // No Numbers wanted
        if (!this.options.hasNumbers)
            $parent.find(".pagination-bar > ul").hide();
        // No prev/next buttons
        if (!this.options.hasPrevNext)
            $parent.find(".prev, .next").hide();
    },
    buttonEvents: function() {
        /**
         * Set up the "previous" and "next" button events. 
         */
        var $parent = $(this.parent), self = this;
        // set events
        $parent.find(".next").off("click").on("click", function(evt) {
            if (!$(this).hasClass("disabled"))
                self.next();
        });
        $parent.find(".prev").off("click").on("click", function(evt) {
            if (!$(this).hasClass("disabled"))
                self.previous();
        });
    },
    inputEvent: function() {
        /**
         * Set the events for the input and button.
         */
        var $parent = $(this.parent), self = this,
        handler = function(value) {
            // prevent repetitive code
            if (self.isNum(value) && (self.currentPage != value))
                self.goto(Number(value));
        };
        // set events
        $parent.find(".pagination-input input").off("keydown").on("keydown", function(evt) {
            var value = Number($(this).val());
            if (!$(this).hasClass("disabled"))
                // Must be "Enter" pressed && a number value
                if (evt.which === 13 || evt.key === "Enter")  // Enter pressed
                    handler(value);
        });
        $parent.find(".pagination-input button").off("click").on("click", function(evt) {
            var value = Number($parent.find(".pagination-input input").val());
            if (!$(this).hasClass("disabled"))
                handler(value);
        });
    },
    // main page navigator func
    goto: function(page) {
        /**
         * Makes a call for data on page `page`.
         * Before calling, runs the `beforePaging` function.
         *  (Ideal place for showing loaders)
         * After call completes, data is passed to the `render` function.
         *  (Where you use the data, construct something or handle "no data")
         * After calling, runs the `afterPaging` function.
         *  (Ideal for hiding loaders)
         */
        if (!page) page = 1;  // Default
        if (page > 0 && page <= this.maxPage) {  // Must be in range
            // set complete function
            var self = this, given = {}, additional, ajaxSettings, 
            complete = function(response) {
                // handle the response here
                var data = response.responseJSON[self.options.dataKey],
                total = response.responseJSON[self.options.totalKey],
                max = Math.ceil(total / self.options.itemsPerPage);
                if (max != self.maxPage) self.maxPage = max;
                self.currentData = data;
                // render
                self.options.render(data, self);
                if (page > max) self.currentPage = max;
                else self.currentPage = page;
                self.lastKnownTotal = total;
                // update display and after
                self.updateNumbers(page);
                // next/prev button disabling
                if (self.currentPage == self.maxPage)
                    $(self.parent).find(".next").addClass("disabled");
                else 
                    $(self.parent).find(".next").removeClass("disabled");
                if (self.currentPage == 1)
                    $(self.parent).find(".prev").addClass("disabled");
                else 
                    $(self.parent).find(".prev").removeClass("disabled");
                // after paging fn
                if (self.isFunc(self.options.afterPaging))
                    self.options.afterPaging(self);
            };
            // assign to object
            given.data = {};
            given.data.page = page;
            given.data.amount = this.options.itemsPerPage;
            given.complete = complete;
            // request data
            if (this.isFunc(this.options.ajaxData)) additional = this.options.ajaxData();
            else additional = this.options.ajaxData;
            given.data = Object.assign(given.data, additional);
            // get ajax settings
            ajaxSettings = this.getAjaxOptions(given);
            // run before
            if (this.isFunc(this.options.beforePaging))
                this.options.beforePaging(self);
            // make call
            this.makeCall(this.options.url, ajaxSettings);
        }
    },
    // event set for numbers
    numberEvents: function() {
        /**
         * Setup number click events.
         * This should be called when the numbers are
         * changed.
         */
        var self = this, $parent = $(this.parent);
        
        // On .page click
        $parent.find(".page").off("click").on("click", function(evt) {
            if (!$(this).hasClass("active")) {
                // Not current page
                var value = Number($(this).text());
                self.goto(value);
            }
        });
    },
    // visual updater
    updateNumbers: function(page) {
        /**
         * Update the numbers and their interactivity on the 
         * pagination bar.
         */
        // determine (new(?)) max page
        if (!page) page = this.currentPage;
        var max = this.maxPage;
        
        // change numbers in bar
        var items = [], $parent = $(this.parent),
        builder = function(num, activeNum) {
            // element builder
            var $el = $("<li class=\"page\">" + num + "</li>");    
            if (num == activeNum) $el.addClass("active");
            return $el
        };
        items.push(builder(1, page));  // ALWAYS first page
        // if more than 1 page
        if (max > 1) {
            // get a range around page (page +/- margin)
            var range = [
                (page - this.options.numberMargin),
                (page + this.options.numberMargin)
            ];
            if (range[0] < 2) range[0] = 2;  // remove < 2
            if (range[1] > (max - 1)) range[1] = (max - 1);  // remove > max - 1
            if (range[0] != 2) items.push($("<li>...</li>"));  // if first range item is not 2, ellipsis
            for (var i=range[0]; i<=range[1]; i++)  // add range items
                items.push(builder(i, page));
            if (range[1] != (max - 1)) items.push($("<li>...</li>"));  // if last range item is not item before max, ellipsis
        }
        if (max != 1) items.push(builder(max, page));  // last page

        $parent.find("ul").empty().append(items);
        // set the event
        this.numberEvents();
    },
    // Simple next/prev functions
    next: function() {
        /**
         * Go to "next" page.
         * Cannot be higher than max page.
         */
        if (this.currentPage + 1 <= this.maxPage)
            this.goto(this.currentPage + 1);
    },
    previous: function() {
        /**
         * Go to "prev" page.
         * Cannot be lower than page 1.
         */
        if (this.currentPage - 1 > 0)
            this.goto(this.currentPage - 1);
    },
});
