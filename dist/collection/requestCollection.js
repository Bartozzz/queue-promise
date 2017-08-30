"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasicCollection = require("basic-collection");

/**
 * Request collection.
 *
 * @author    Łaniewski Bartosz <laniewski.bartozzz@gmail.com> (//laniewski.me)
 * @copyright Copyright (c) 2016 Łaniewski Bartosz
 * @license   MIT
 */

var RequestCollection = function (_BasicCollection) {
    _inherits(RequestCollection, _BasicCollection);

    /**
     * Create a new `Collection` instance with optionally injected parameters.
     *
     * @param   array   parameters
     * @access  public
     */
    function RequestCollection(parameters) {
        _classCallCheck(this, RequestCollection);

        var _this = _possibleConstructorReturn(this, (RequestCollection.__proto__ || Object.getPrototypeOf(RequestCollection)).call(this, parameters));

        _this.index = 0;
        return _this;
    }

    /**
     * Set an attribute for the current collection.
     *
     * @param   function    request
     * @throws  Request must be a valid Promise function
     * @access  public
     */


    _createClass(RequestCollection, [{
        key: "add",
        value: function add(request) {
            if (typeof request !== "function") {
                throw new Error("You must provide a valid function, not " + (typeof request === "undefined" ? "undefined" : _typeof(request)) + ".");
            }

            _get(RequestCollection.prototype.__proto__ || Object.getPrototypeOf(RequestCollection.prototype), "set", this).call(this, this.index++, request);
        }
    }]);

    return RequestCollection;
}(BasicCollection);

;

module.exports = RequestCollection;