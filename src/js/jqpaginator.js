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
 * 
 * Options can also be one of the following:
 * `"destroy"`: Removes paginator and all events
 */
(function($) {
    var defaults = {
        parentcls: 'jqpaginator',
        wrapcls: 'jqp-wrap',
        pageListcls: 'jqp-pages',
        pageItemcls: 'jqp-page',
        inputcls: 'jqp-input',
        prevcls: 'jqp-prev',
        nextcls: 'jqp-next',
        activecls: 'jqp-active',
        disabledcls: 'jqp-disable',

        afterPagingEvent: 'after-paging',
        beforePagingEvent: 'before-paging',
    };
    var fn = {
        // util
        bind: function(event, $element, func) {
            // Binding events
            if (!func) return;  // Ignore
            $element.on(event, func);
        },
        next: function() {
            // `this` is the next button
            if (!$(this).hasClass(defaults.disabledcls)) {
                console.log("Next");
            }
        },
        prev: function() {
            // `this` is the prev button
            if (!$(this).hasClass(defaults.disabledcls)) {
                console.log("Prev");
            }
        },
        calcListNums: function(margin, perPage, total, active) {
            var l = [1,];  // Always show first
            // maximum
            var maxPages = Math.ceil(total / perPage);
            if (maxPages < 1) maxPages = 1;

            if (maxPages > 1) {
                var range = [(active - margin), (active + margin)];
                if (range[0] < 2) range[0] = 2;  // remove < 2, because 1 exists
                if (range[1] > (maxPages - 1)) range[1] = (maxPages - 1);  // remove > max - 1
                if (range[0] > 2) l.push("...");  // if first range item is not 2, ellipsis
                // intermediary numbers
                var n = range[0];
                while (n <= range[1]) {
                    l.push(n);
                    n++;
                }
                if (range[1] < (maxPages - 1)) l.push("...");
                l.push(maxPages);
            }

            return l;
        },
        // result of data
        done: function(dataArray, total) {
            /**
             * Passed to `data` function, and accepts a 
             * `dataArray` as the data returned from the
             * `data` function, and the number `total` of 
             * total data items.
             * Triggers "after paging" event.
             */
            console.log("Done getting data:");
            console.log(dataArray, total);
        },
        // construction
        buildPaginator: function() {
            // return paginator object - initial setup
            var $parent = this.parent;
            var options = this.options;
            var buttons, buttonTxt;
            var numbers, numMargin;
            var input, perPage;
            // wrapper
            var $paginator = $("<div><div>");
            $paginator.addClass(defaults.wrapcls);
            // buttons
            if (options.showButtons) {
                buttonTxt = (options.buttonText) ? options.buttonText : opt.buttonText;
                buttons = fn.createButtons($parent, buttonTxt);
            }
            // numbers
            if (options.showNumbers) {
                numMargin = (options.numberMargin) ? options.numberMargin : opt.numberMargin;
                perPage = (options.itemsPerPage) ? options.itemsPerPage : opt.itemsPerPage;
                numbers = fn.createNumbers($parent, numMargin, perPage, 1);
            }
            // input 
            if (options.showInput) {
                input = fn.createInput($parent);
            }

            // add items to paginator
            if (buttons) $paginator.append(buttons[0]);
            if (numbers) $paginator.append(numbers);
            if (buttons) $paginator.append(buttons[1]);
            if (input) $paginator.append(input);

            $parent.append($paginator);
        },
        createButtons: function($parent, texts) {
            // return two button elements in array
            var $prev, $next;
            // build
            $prev = $("<div></div>");
            $prev.addClass(defaults.prevcls);
            $prev.append("<button>" + texts[0].toString() + "</button>");

            $next = $("<div></div>");
            $next.addClass(defaults.nextcls);
            $next.append("<button>" + texts[1].toString() + "</button>");

            // event
            fn.bind('click', $prev.find("button"), function() { fn.prev($parent); });
            fn.bind('click', $next.find("button"), function() { fn.next($parent); });

            // return
            return [$prev, $next];
        },
        createNumbers: function($parent, margin, perPage, total, active) {
            // return the list of numbers
            if (!active) active = 1;
            var $numbers = $("<ul></ul>");
            var numList;
            $numbers.addClass(defaults.pageListcls);

            numList = fn.calcListNums(margin, perPage, 100, active);

            for (var i=0; i<numList.length; i++) {
                $numbers.append(
                    fn.createNumber(numList[i], active)
                );
            }

            // event
            function handler() {
                var page = Number($(this).text());
                fn.goto($parent, page);
            }
            fn.bind('click', $numbers.find('.'+defaults.pageItemcls), handler);

            return $numbers;
        },
        createNumber: function(num, activeNum) {
            var $el = $("<li>" + num + "</li>");
            if (!isNaN(Number(num))) $el.addClass(defaults.pageItemcls);
            if (num == activeNum) $el.addClass(defaults.activecls);
            return $el;
        },
        createInput: function($parent) {
            // return input for paging
            var $input = $("<input type=\"text\">");
            $input.addClass(defaults.inputcls);

            var handler = function() {
                // var
                var active = $(this).parent().find('.'+defaults.activecls).text();
                var value = $(this).val();
                var valid = (!isNaN(Number(value)));
                // must be a number, must not be current number
                if (valid && active !== value) {
                    fn.goto($parent, Number(value));
                }
            };

            fn.bind('change', $input, handler);

            return $input;
        },
        // init
        init: function() {
            // Check & throw/warn
            var $parent = this.parent;
            var options = this.options;

            if ($parent.hasClass(defaults.parentcls)) {
                console.warn("jq-paginator: This element has already been instanced, or contains a reserved class, aborting.");
                return;
            }
            if (!options.data) 
                throw Error("jq-paginator: Cannot operate without data array or function!");
            if (!options.render)
                throw Error("jq-paginator: A render function is required to display data selection!");
            if (!options.showButtons && !options.showNumbers && !options.showInput)
                throw Error("jq-paginator: At least 1 display should be allowed for pagination! Use 1 or more of 'showNumbers', 'showInput' or 'showButtons' as true.");

            // Build
            this.buildPaginator();

            // Get first page
            fn.goto($parent, 1);
        },
        // interaction
        goto: function($parent, page) {
            console.log("goto", page);
            if (!page) page = 1;
            if (!isNaN(page)) page = Number(page);
            else throw Error("jqpaginator: Page number to go to is not a number!");
            // var
            var max;

            $parent.find('.'+defaults.pageItemcls).each(function() {
                var val = Number($(this).text());
                if (!isNaN(val) && val > max) max = val;
            });
            if (page > 0 && page <= max) {
                console.log("go");
            }
        },
        reload: function($parent) {},
        destroy: function($parent) {},
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
    };


    function Paginator(options) {
        // Object so as to keep track of important data.
        this.options = options;
        this.parent = parent;

        this.init();
    }
    Object.defineProperty(Paginator, 'constructor', {value: Paginator, enumerable: false, writable: true});
    Object.assign(Paginator.prototype, fn);

    var instances = {};

    $.fn.jqpaginator = function(options, val) {
        if (typeof options === "object") {
            // creation
            return this.each(function() {
                var eid = 'jqp' + new Date().getTime();
                instances[eid] = new Paginator($(this), options);
            });
        } else {  // WIP
            // interaction
            switch(options) {
                case "destroy":
                    break;
                case "reload":
                    break;
                case "goto":
                    fn.goto($parent, val);
                    break;
                default:
                    console.warn("jq-paginator: Unrecognised action, ignoring.");
            }
        }
    };

})(jQuery);



// old stuff i had for a thing
function _Paginator(parent, options, runOnInit) {
    this.parent = parent;
    this.currentPage = 1;
    this.maxPage = 1;
    this.lastKnownTotal = 1;
    this.currentData = null;
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
_Paginator.prototype = Object.assign(_Paginator.prototype, {
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
