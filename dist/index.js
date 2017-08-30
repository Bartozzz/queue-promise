"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require("event-emitter");
var RequestCollection = require("./collection/requestCollection");

/**
 * Queue class for promises.
 *
 * @author    Łaniewski Bartosz <laniewski.bartozzz@gmail.com> (//laniewski.me)
 * @copyright Copyright (c) 2016 Łaniewski Bartosz
 * @license   MIT
 */

var Queue = function (_RequestCollection) {
    _inherits(Queue, _RequestCollection);

    /**
     * Create a new `Queue` instance with optionally injected options.
     *
     * @param   object  options
     * @param   int     options.concurrency
     * @param   int     options.interval
     * @access  public
     */
    function Queue(options) {
        _classCallCheck(this, Queue);

        var _this = _possibleConstructorReturn(this, (Queue.__proto__ || Object.getPrototypeOf(Queue)).call(this));

        _this.options = Object.assign({
            concurrency: 5,
            interval: 500
        }, options);

        _this.events = new EventEmitter();
        _this.current = 0;
        _this.started = false;
        _this.interval = null;
        return _this;
    }

    /**
     * Starts the queue.
     *
     * @emits   start|tick|request|error
     * @access  public
     */


    _createClass(Queue, [{
        key: "start",
        value: function start() {
            var _this2 = this;

            if (this.started) {
                return;
            }

            this.events.emit("start");

            this.started = true;
            this.interval = setInterval(function () {
                _this2.events.emit("tick");

                _this2.each(function (promise, id) {
                    if (_this2.current + 1 > _this2.options.concurrency) {
                        return;
                    }

                    _this2.current++;
                    _this2.remove(id);

                    promise().then(function () {
                        var _events;

                        for (var _len = arguments.length, output = Array(_len), _key = 0; _key < _len; _key++) {
                            output[_key] = arguments[_key];
                        }

                        (_events = _this2.events).emit.apply(_events, ["resolve"].concat(output));
                        _this2.next();
                    }).catch(function (error) {
                        _this2.events.emit("reject", error);
                        _this2.next();
                    });
                });
            }, this.options.interval);
        }

        /**
         * Stops the queue.
         *
         * @emits   stop
         * @access  public
         */

    }, {
        key: "stop",
        value: function stop() {
            this.events.emit("stop");

            this.started = false;
            this.interval = clearInterval(this.interval);
        }

        /**
         * Goes to the next request and stops the loop if there is no requests left.
         *
         * @emits   end
         * @access  private
         */

    }, {
        key: "next",
        value: function next() {
            if (--this.current === 0 && this.size === 0) {
                this.events.emit("end");
                this.stop();
            }
        }

        /**
         * Sets a `callback` for an `event`.
         *
         * @param   event       Event name
         * @param   callback    Event callback
         * @access  public
         */

    }, {
        key: "on",
        value: function on(event, callback) {
            this.events.on(event, callback);
        }
    }]);

    return Queue;
}(RequestCollection);

;

module.exports = Queue;