(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.TelnyxWebRTC = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
    var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

    function rng() {
      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }

      return getRandomValues(rnds8);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

      return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
    }

    function v4(options, buf, offset) {
      var i = buf && offset || 0;

      if (typeof options == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
      }

      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || bytesToUuid(rnds);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var loglevel = createCommonjsModule(function (module) {
    /*
    * loglevel - https://github.com/pimterry/loglevel
    *
    * Copyright (c) 2013 Tim Perry
    * Licensed under the MIT license.
    */
    (function (root, definition) {
        if ( module.exports) {
            module.exports = definition();
        } else {
            root.log = definition();
        }
    }(commonjsGlobal, function () {

        // Slightly dubious tricks to cut down minimized file size
        var noop = function() {};
        var undefinedType = "undefined";
        var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
            /Trident\/|MSIE /.test(window.navigator.userAgent)
        );

        var logMethods = [
            "trace",
            "debug",
            "info",
            "warn",
            "error"
        ];

        // Cross-browser bind equivalent that works at least back to IE6
        function bindMethod(obj, methodName) {
            var method = obj[methodName];
            if (typeof method.bind === 'function') {
                return method.bind(obj);
            } else {
                try {
                    return Function.prototype.bind.call(method, obj);
                } catch (e) {
                    // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                    return function() {
                        return Function.prototype.apply.apply(method, [obj, arguments]);
                    };
                }
            }
        }

        // Trace() doesn't print the message in IE, so for that case we need to wrap it
        function traceForIE() {
            if (console.log) {
                if (console.log.apply) {
                    console.log.apply(console, arguments);
                } else {
                    // In old IE, native console methods themselves don't have apply().
                    Function.prototype.apply.apply(console.log, [console, arguments]);
                }
            }
            if (console.trace) console.trace();
        }

        // Build the best logging method possible for this env
        // Wherever possible we want to bind, not wrap, to preserve stack traces
        function realMethod(methodName) {
            if (methodName === 'debug') {
                methodName = 'log';
            }

            if (typeof console === undefinedType) {
                return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
            } else if (methodName === 'trace' && isIE) {
                return traceForIE;
            } else if (console[methodName] !== undefined) {
                return bindMethod(console, methodName);
            } else if (console.log !== undefined) {
                return bindMethod(console, 'log');
            } else {
                return noop;
            }
        }

        // These private functions always need `this` to be set properly

        function replaceLoggingMethods(level, loggerName) {
            /*jshint validthis:true */
            for (var i = 0; i < logMethods.length; i++) {
                var methodName = logMethods[i];
                this[methodName] = (i < level) ?
                    noop :
                    this.methodFactory(methodName, level, loggerName);
            }

            // Define log.log as an alias for log.debug
            this.log = this.debug;
        }

        // In old IE versions, the console isn't present until you first open it.
        // We build realMethod() replacements here that regenerate logging methods
        function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
            return function () {
                if (typeof console !== undefinedType) {
                    replaceLoggingMethods.call(this, level, loggerName);
                    this[methodName].apply(this, arguments);
                }
            };
        }

        // By default, we use closely bound real methods wherever possible, and
        // otherwise we wait for a console to appear, and then try again.
        function defaultMethodFactory(methodName, level, loggerName) {
            /*jshint validthis:true */
            return realMethod(methodName) ||
                   enableLoggingWhenConsoleArrives.apply(this, arguments);
        }

        function Logger(name, defaultLevel, factory) {
          var self = this;
          var currentLevel;
          defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;

          var storageKey = "loglevel";
          if (typeof name === "string") {
            storageKey += ":" + name;
          } else if (typeof name === "symbol") {
            storageKey = undefined;
          }

          function persistLevelIfPossible(levelNum) {
              var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

              if (typeof window === undefinedType || !storageKey) return;

              // Use localStorage if available
              try {
                  window.localStorage[storageKey] = levelName;
                  return;
              } catch (ignore) {}

              // Use session cookie as fallback
              try {
                  window.document.cookie =
                    encodeURIComponent(storageKey) + "=" + levelName + ";";
              } catch (ignore) {}
          }

          function getPersistedLevel() {
              var storedLevel;

              if (typeof window === undefinedType || !storageKey) return;

              try {
                  storedLevel = window.localStorage[storageKey];
              } catch (ignore) {}

              // Fallback to cookies if local storage gives us nothing
              if (typeof storedLevel === undefinedType) {
                  try {
                      var cookie = window.document.cookie;
                      var location = cookie.indexOf(
                          encodeURIComponent(storageKey) + "=");
                      if (location !== -1) {
                          storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                      }
                  } catch (ignore) {}
              }

              // If the stored level is not valid, treat it as if nothing was stored.
              if (self.levels[storedLevel] === undefined) {
                  storedLevel = undefined;
              }

              return storedLevel;
          }

          function clearPersistedLevel() {
              if (typeof window === undefinedType || !storageKey) return;

              // Use localStorage if available
              try {
                  window.localStorage.removeItem(storageKey);
                  return;
              } catch (ignore) {}

              // Use session cookie as fallback
              try {
                  window.document.cookie =
                    encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
              } catch (ignore) {}
          }

          /*
           *
           * Public logger API - see https://github.com/pimterry/loglevel for details
           *
           */

          self.name = name;

          self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
              "ERROR": 4, "SILENT": 5};

          self.methodFactory = factory || defaultMethodFactory;

          self.getLevel = function () {
              return currentLevel;
          };

          self.setLevel = function (level, persist) {
              if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
                  level = self.levels[level.toUpperCase()];
              }
              if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                  currentLevel = level;
                  if (persist !== false) {  // defaults to true
                      persistLevelIfPossible(level);
                  }
                  replaceLoggingMethods.call(self, level, name);
                  if (typeof console === undefinedType && level < self.levels.SILENT) {
                      return "No console available for logging";
                  }
              } else {
                  throw "log.setLevel() called with invalid level: " + level;
              }
          };

          self.setDefaultLevel = function (level) {
              defaultLevel = level;
              if (!getPersistedLevel()) {
                  self.setLevel(level, false);
              }
          };

          self.resetLevel = function () {
              self.setLevel(defaultLevel, false);
              clearPersistedLevel();
          };

          self.enableAll = function(persist) {
              self.setLevel(self.levels.TRACE, persist);
          };

          self.disableAll = function(persist) {
              self.setLevel(self.levels.SILENT, persist);
          };

          // Initialize with the right level
          var initialLevel = getPersistedLevel();
          if (initialLevel == null) {
              initialLevel = defaultLevel;
          }
          self.setLevel(initialLevel, false);
        }

        /*
         *
         * Top-level API
         *
         */

        var defaultLogger = new Logger();

        var _loggersByName = {};
        defaultLogger.getLogger = function getLogger(name) {
            if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
              throw new TypeError("You must supply a name when creating a logger.");
            }

            var logger = _loggersByName[name];
            if (!logger) {
              logger = _loggersByName[name] = new Logger(
                name, defaultLogger.getLevel(), defaultLogger.methodFactory);
            }
            return logger;
        };

        // Grab the current global log variable in case of overwrite
        var _log = (typeof window !== undefinedType) ? window.log : undefined;
        defaultLogger.noConflict = function() {
            if (typeof window !== undefinedType &&
                   window.log === defaultLogger) {
                window.log = _log;
            }

            return defaultLogger;
        };

        defaultLogger.getLoggers = function getLoggers() {
            return _loggersByName;
        };

        // ES6 default export, for compatibility
        defaultLogger['default'] = defaultLogger;

        return defaultLogger;
    }));
    });

    const datetime = () => new Date().toISOString().replace('T', ' ').replace('Z', '');
    const logger = loglevel.getLogger('telnyx');
    const originalFactory = logger.methodFactory;
    logger.methodFactory = (methodName, logLevel, loggerName) => {
        const rawMethod = originalFactory(methodName, logLevel, loggerName);
        return function () {
            const messages = [datetime(), '-'];
            for (let i = 0; i < arguments.length; i++) {
                messages.push(arguments[i]);
            }
            rawMethod.apply(undefined, messages);
        };
    };
    logger.setLevel(logger.getLevel());

    const STORAGE_PREFIX = '@telnyx:';
    const SESSION_ID = 'sessId';
    const PROD_HOST = 'wss://rtc.telnyx.com';
    const DEV_HOST = 'wss://rtcdev.telnyx.com';
    const STUN_SERVER = { urls: 'stun:stun.telnyx.com:3478' };
    const TURN_SERVER = {
        urls: 'turn:turn.telnyx.com:3478?transport=tcp',
        username: 'testuser',
        credential: 'testpassword',
    };
    var SwEvent;
    (function (SwEvent) {
        SwEvent["SocketOpen"] = "telnyx.socket.open";
        SwEvent["SocketClose"] = "telnyx.socket.close";
        SwEvent["SocketError"] = "telnyx.socket.error";
        SwEvent["SocketMessage"] = "telnyx.socket.message";
        SwEvent["SpeedTest"] = "telnyx.internal.speedtest";
        SwEvent["Ready"] = "telnyx.ready";
        SwEvent["Error"] = "telnyx.error";
        SwEvent["Notification"] = "telnyx.notification";
        SwEvent["Messages"] = "telnyx.messages";
        SwEvent["Calls"] = "telnyx.calls";
        SwEvent["MediaError"] = "telnyx.rtc.mediaError";
    })(SwEvent || (SwEvent = {}));

    const objEmpty = (obj) => Object.keys(obj).length === 0;
    const mutateStorageKey = (key) => `${STORAGE_PREFIX}${key}`;
    const mutateLiveArrayData = (data) => {
        const [participantId, participantNumber, participantName, codec, mediaJson, participantData,] = data;
        let media = {};
        try {
            media = JSON.parse(mediaJson.replace(/ID"/g, 'Id"'));
        }
        catch (error) {
            logger.warn('Verto LA invalid media JSON string:', mediaJson);
        }
        return {
            participantId: Number(participantId),
            participantNumber,
            participantName,
            codec,
            media,
            participantData,
        };
    };
    const safeParseJson = (value) => {
        if (typeof value !== 'string') {
            return value;
        }
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    };
    const isDefined = (variable) => typeof variable !== 'undefined';
    const isFunction = (variable) => variable instanceof Function || typeof variable === 'function';
    const findElementByType = (tag) => {
        if (typeof document !== 'object' || !('getElementById' in document)) {
            return null;
        }
        if (typeof tag === 'string') {
            return document.getElementById(tag) || null;
        }
        else if (typeof tag === 'function') {
            return tag();
        }
        else if (tag instanceof HTMLMediaElement) {
            return tag;
        }
        return null;
    };
    const PROTOCOL_PATTERN = /^(ws|wss):\/\//;
    const checkWebSocketHost = (host) => {
        const protocol = PROTOCOL_PATTERN.test(host) ? '' : 'wss://';
        return `${protocol}${host}`;
    };
    const destructResponse = (response, nodeId = null) => {
        const { result = {}, error } = response;
        if (error) {
            return { error };
        }
        const { result: nestedResult = null } = result;
        if (nestedResult === null) {
            if (nodeId !== null) {
                result.node_id = nodeId;
            }
            return { result };
        }
        const { code = null, node_id = null, result: vertoResult = null, } = nestedResult;
        if (code && code !== '200') {
            return { error: nestedResult };
        }
        if (vertoResult) {
            return destructResponse(vertoResult, node_id);
        }
        return { result: nestedResult };
    };
    const randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    const isValidOptions = ({ login, passwd, password, login_token, }) => {
        const isLogin = login && (passwd || password);
        const isToken = login_token;
        return Boolean(isLogin || isToken);
    };
    const getGatewayState = (msg) => {
        var _a, _b, _c, _d, _e, _f;
        let stateResult = '';
        let stateParam = '';
        if ((_b = (_a = msg === null || msg === void 0 ? void 0 : msg.result) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.state) {
            stateResult = (_d = (_c = msg === null || msg === void 0 ? void 0 : msg.result) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.state;
        }
        if ((_e = msg === null || msg === void 0 ? void 0 : msg.params) === null || _e === void 0 ? void 0 : _e.state) {
            stateParam = (_f = msg === null || msg === void 0 ? void 0 : msg.params) === null || _f === void 0 ? void 0 : _f.state;
        }
        const gateWayState = stateResult || stateParam;
        return gateWayState;
    };

    const GLOBAL = 'GLOBAL';
    const queue = {};
    const _buildEventName = (event, uniqueId) => `${event}|${uniqueId}`;
    const isQueued = (event, uniqueId = GLOBAL) => {
        const eventName = _buildEventName(event, uniqueId);
        return eventName in queue;
    };
    const register = (event, callback, uniqueId = GLOBAL) => {
        const eventName = _buildEventName(event, uniqueId);
        if (!(eventName in queue)) {
            queue[eventName] = [];
        }
        queue[eventName].push(callback);
    };
    const registerOnce = (event, callback, uniqueId = GLOBAL) => {
        const cb = function (data) {
            deRegister(event, cb, uniqueId);
            callback(data);
        };
        cb.prototype.targetRef = callback;
        return register(event, cb, uniqueId);
    };
    const deRegister = (event, callback, uniqueId = GLOBAL) => {
        if (!isQueued(event, uniqueId)) {
            return false;
        }
        const eventName = _buildEventName(event, uniqueId);
        if (isFunction(callback)) {
            const len = queue[eventName].length;
            for (let i = len - 1; i >= 0; i--) {
                const fn = queue[eventName][i];
                if (callback === fn ||
                    (fn.prototype && callback === fn.prototype.targetRef)) {
                    queue[eventName].splice(i, 1);
                }
            }
        }
        else {
            queue[eventName] = [];
        }
        if (queue[eventName].length === 0) {
            delete queue[eventName];
        }
        return true;
    };
    const trigger = (event, data, uniqueId = GLOBAL, globalPropagation = true) => {
        const _propagate = globalPropagation && uniqueId !== GLOBAL;
        if (!isQueued(event, uniqueId)) {
            if (_propagate) {
                trigger(event, data);
            }
            return false;
        }
        const eventName = _buildEventName(event, uniqueId);
        const len = queue[eventName].length;
        if (!len) {
            if (_propagate) {
                trigger(event, data);
            }
            return false;
        }
        for (let i = len - 1; i >= 0; i--) {
            queue[eventName][i](data);
        }
        if (_propagate) {
            trigger(event, data);
        }
        return true;
    };
    const deRegisterAll = (event) => {
        const eventName = _buildEventName(event, '');
        Object.keys(queue)
            .filter((name) => name.indexOf(eventName) === 0)
            .forEach((event) => delete queue[event]);
    };

    var PeerType;
    (function (PeerType) {
        PeerType["Offer"] = "offer";
        PeerType["Answer"] = "answer";
    })(PeerType || (PeerType = {}));
    var Direction;
    (function (Direction) {
        Direction["Inbound"] = "inbound";
        Direction["Outbound"] = "outbound";
    })(Direction || (Direction = {}));
    var VertoMethod;
    (function (VertoMethod) {
        VertoMethod["Invite"] = "telnyx_rtc.invite";
        VertoMethod["Attach"] = "telnyx_rtc.attach";
        VertoMethod["Answer"] = "telnyx_rtc.answer";
        VertoMethod["Info"] = "telnyx_rtc.info";
        VertoMethod["Display"] = "telnyx_rtc.display";
        VertoMethod["Media"] = "telnyx_rtc.media";
        VertoMethod["Event"] = "telnyx_rtc.event";
        VertoMethod["Bye"] = "telnyx_rtc.bye";
        VertoMethod["Punt"] = "telnyx_rtc.punt";
        VertoMethod["Broadcast"] = "telnyx_rtc.broadcast";
        VertoMethod["Subscribe"] = "telnyx_rtc.subscribe";
        VertoMethod["Unsubscribe"] = "telnyx_rtc.unsubscribe";
        VertoMethod["ClientReady"] = "telnyx_rtc.clientReady";
        VertoMethod["Modify"] = "telnyx_rtc.modify";
        VertoMethod["Ringing"] = "telnyx_rtc.ringing";
        VertoMethod["GatewayState"] = "telnyx_rtc.gatewayState";
        VertoMethod["Ping"] = "telnyx_rtc.ping";
        VertoMethod["Pong"] = "telnyx_rtc.pong";
    })(VertoMethod || (VertoMethod = {}));
    const NOTIFICATION_TYPE = {
        generic: 'event',
        [VertoMethod.Display]: 'participantData',
        [VertoMethod.Attach]: 'participantData',
        conferenceUpdate: 'conferenceUpdate',
        callUpdate: 'callUpdate',
        vertoClientReady: 'vertoClientReady',
        userMediaError: 'userMediaError',
    };
    const DEFAULT_CALL_OPTIONS = {
        destinationNumber: '',
        remoteCallerName: 'Outbound Call',
        remoteCallerNumber: '',
        callerName: '',
        callerNumber: '',
        audio: true,
        video: false,
        useStereo: false,
        attach: false,
        screenShare: false,
        userVariables: {},
        mediaSettings: { useSdpASBandwidthKbps: false, sdpASBandwidthKbps: 0 },
    };
    var State;
    (function (State) {
        State[State["New"] = 0] = "New";
        State[State["Requesting"] = 1] = "Requesting";
        State[State["Trying"] = 2] = "Trying";
        State[State["Recovering"] = 3] = "Recovering";
        State[State["Ringing"] = 4] = "Ringing";
        State[State["Answering"] = 5] = "Answering";
        State[State["Early"] = 6] = "Early";
        State[State["Active"] = 7] = "Active";
        State[State["Held"] = 8] = "Held";
        State[State["Hangup"] = 9] = "Hangup";
        State[State["Destroy"] = 10] = "Destroy";
        State[State["Purge"] = 11] = "Purge";
    })(State || (State = {}));
    var Role;
    (function (Role) {
        Role["Participant"] = "participant";
        Role["Moderator"] = "moderator";
    })(Role || (Role = {}));
    var ConferenceAction;
    (function (ConferenceAction) {
        ConferenceAction["Join"] = "join";
        ConferenceAction["Leave"] = "leave";
        ConferenceAction["Bootstrap"] = "bootstrap";
        ConferenceAction["Add"] = "add";
        ConferenceAction["Modify"] = "modify";
        ConferenceAction["Delete"] = "delete";
        ConferenceAction["Clear"] = "clear";
        ConferenceAction["ChatMessage"] = "chatMessage";
        ConferenceAction["LayerInfo"] = "layerInfo";
        ConferenceAction["LogoInfo"] = "logoInfo";
        ConferenceAction["LayoutInfo"] = "layoutInfo";
        ConferenceAction["LayoutList"] = "layoutList";
        ConferenceAction["ModCmdResponse"] = "modCommandResponse";
    })(ConferenceAction || (ConferenceAction = {}));
    var DeviceType;
    (function (DeviceType) {
        DeviceType["Video"] = "videoinput";
        DeviceType["AudioIn"] = "audioinput";
        DeviceType["AudioOut"] = "audiooutput";
    })(DeviceType || (DeviceType = {}));
    var GatewayStateType;
    (function (GatewayStateType) {
        GatewayStateType["REGED"] = "REGED";
        GatewayStateType["UNREGED"] = "UNREGED";
        GatewayStateType["NOREG"] = "NOREG";
        GatewayStateType["FAILED"] = "FAILED";
        GatewayStateType["FAIL_WAIT"] = "FAIL_WAIT";
        GatewayStateType["REGISTER"] = "REGISTER";
        GatewayStateType["TRYING"] = "TRYING";
        GatewayStateType["EXPIRED"] = "EXPIRED";
        GatewayStateType["UNREGISTER"] = "UNREGISTER";
    })(GatewayStateType || (GatewayStateType = {}));

    let WebSocketClass = typeof WebSocket !== 'undefined' ? WebSocket : null;
    const WS_STATE = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
    };
    const TIMEOUT_MS = 10 * 1000;
    class Connection {
        constructor(session) {
            this.session = session;
            this.previousGatewayState = '';
            this._wsClient = null;
            this._host = PROD_HOST;
            this._timers = {};
            this.upDur = null;
            this.downDur = null;
            const { host, env } = session.options;
            if (host) {
                this._host = checkWebSocketHost(host);
            }
            if (env) {
                this._host = env === 'development' ? DEV_HOST : PROD_HOST;
            }
        }
        get connected() {
            return this._wsClient && this._wsClient.readyState === WS_STATE.OPEN;
        }
        get connecting() {
            return this._wsClient && this._wsClient.readyState === WS_STATE.CONNECTING;
        }
        get closing() {
            return this._wsClient && this._wsClient.readyState === WS_STATE.CLOSING;
        }
        get closed() {
            return this._wsClient && this._wsClient.readyState === WS_STATE.CLOSED;
        }
        get isAlive() {
            return this.connecting || this.connected;
        }
        get isDead() {
            return this.closing || this.closed;
        }
        connect() {
            this._wsClient = new WebSocketClass(this._host);
            this._wsClient.onopen = (event) => trigger(SwEvent.SocketOpen, event, this.session.uuid);
            this._wsClient.onclose = (event) => trigger(SwEvent.SocketClose, event, this.session.uuid);
            this._wsClient.onerror = (event) => trigger(SwEvent.SocketError, event, this.session.uuid);
            this._wsClient.onmessage = (event) => {
                var _a, _b;
                const msg = safeParseJson(event.data);
                if (typeof msg === 'string') {
                    this._handleStringResponse(msg);
                    return;
                }
                this._unsetTimer(msg.id);
                logger.debug('RECV: \n', JSON.stringify(msg, null, 2), '\n');
                if (GatewayStateType[`${(_b = (_a = msg === null || msg === void 0 ? void 0 : msg.result) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.state}`] ||
                    !trigger(msg.id, msg)) {
                    const gateWayState = getGatewayState(msg);
                    trigger(SwEvent.SocketMessage, msg, this.session.uuid);
                    if (Boolean(gateWayState)) {
                        this.previousGatewayState = gateWayState;
                    }
                }
            };
        }
        sendRawText(request) {
            this._wsClient.send(request);
        }
        send(bladeObj) {
            const { request } = bladeObj;
            const promise = new Promise((resolve, reject) => {
                if (request.hasOwnProperty('result')) {
                    return resolve();
                }
                registerOnce(request.id, (response) => {
                    const { result, error } = destructResponse(response);
                    return error ? reject(error) : resolve(result);
                });
                this._setTimer(request.id);
            });
            logger.debug('SEND: \n', JSON.stringify(request, null, 2), '\n');
            this._wsClient.send(JSON.stringify(request));
            return promise;
        }
        close() {
            if (this._wsClient) {
                isFunction(this._wsClient._beginClose)
                    ? this._wsClient._beginClose()
                    : this._wsClient.close();
            }
            this._wsClient = null;
        }
        _unsetTimer(id) {
            clearTimeout(this._timers[id]);
            delete this._timers[id];
        }
        _setTimer(id) {
            this._timers[id] = setTimeout(() => {
                trigger(id, {
                    error: { code: this.session.timeoutErrorCode, message: 'Timeout' },
                });
                this._unsetTimer(id);
            }, TIMEOUT_MS);
        }
        _handleStringResponse(response) {
            if (/^#SP/.test(response)) {
                switch (response[3]) {
                    case 'U':
                        this.upDur = parseInt(response.substring(4));
                        break;
                    case 'D':
                        this.downDur = parseInt(response.substring(4));
                        trigger(SwEvent.SpeedTest, { upDur: this.upDur, downDur: this.downDur }, this.session.uuid);
                        break;
                }
            }
            else {
                logger.warn('Unknown message from socket', response);
            }
        }
    }

    const _inNode = () => typeof window === 'undefined' && typeof process !== 'undefined';
    const _get = (storageType, key) => __awaiter(void 0, void 0, void 0, function* () {
        if (_inNode())
            return null;
        const res = window[storageType].getItem(mutateStorageKey(key));
        return safeParseJson(res);
    });
    const _set = (storageType, key, value) => __awaiter(void 0, void 0, void 0, function* () {
        if (_inNode())
            return null;
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        window[storageType].setItem(mutateStorageKey(key), value);
    });
    const _remove = (storageType, key) => __awaiter(void 0, void 0, void 0, function* () {
        if (_inNode())
            return null;
        return window[storageType].removeItem(mutateStorageKey(key));
    });
    const sessionStorage = {
        getItem: (key) => _get('sessionStorage', key),
        setItem: (key, value) => _set('sessionStorage', key, value),
        removeItem: (key) => _remove('sessionStorage', key),
    };

    const KEEPALIVE_INTERVAL = 10 * 1000;
    class BaseSession {
        constructor(options) {
            this.options = options;
            this.uuid = v4();
            this.sessionid = '';
            this.subscriptions = {};
            this.signature = null;
            this.relayProtocol = null;
            this.contexts = [];
            this.timeoutErrorCode = -32000;
            this.connection = null;
            this._jwtAuth = false;
            this._doKeepAlive = false;
            this._autoReconnect = true;
            this._idle = false;
            this._executeQueue = [];
            if (!this.validateOptions()) {
                throw new Error('Invalid init options');
            }
            this._onSocketOpen = this._onSocketOpen.bind(this);
            this._onSocketCloseOrError = this._onSocketCloseOrError.bind(this);
            this._onSocketMessage = this._onSocketMessage.bind(this);
            this._handleLoginError = this._handleLoginError.bind(this);
            this._attachListeners();
            this.connection = new Connection(this);
        }
        get __logger() {
            return logger;
        }
        get connected() {
            return this.connection && this.connection.connected;
        }
        get reconnectDelay() {
            return randomInt(2, 6) * 1000;
        }
        execute(msg) {
            if (this._idle) {
                return new Promise((resolve) => this._executeQueue.push({ resolve, msg }));
            }
            if (!this.connected) {
                return new Promise((resolve) => {
                    this._executeQueue.push({ resolve, msg });
                    this.connect();
                });
            }
            return this.connection.send(msg).catch((error) => {
                if (error.code && error.code === this.timeoutErrorCode) {
                    this._closeConnection();
                }
                throw error;
            });
        }
        executeRaw(text) {
            if (this._idle) {
                this._executeQueue.push({ msg: text });
                return;
            }
            this.connection.sendRawText(text);
        }
        validateOptions() {
            return isValidOptions(this.options);
        }
        broadcast(params) { }
        disconnect() {
            return __awaiter(this, void 0, void 0, function* () {
                clearTimeout(this._reconnectTimeout);
                this.subscriptions = {};
                this._autoReconnect = false;
                this.relayProtocol = null;
                this._closeConnection();
                yield sessionStorage.removeItem(this.signature);
                this._executeQueue = [];
                this._detachListeners();
            });
        }
        on(eventName, callback) {
            register(eventName, callback, this.uuid);
            return this;
        }
        off(eventName, callback) {
            deRegister(eventName, callback, this.uuid);
            return this;
        }
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.connection) {
                    this.connection = new Connection(this);
                }
                this._attachListeners();
                if (!this.connection.isAlive) {
                    this.connection.connect();
                }
            });
        }
        _handleLoginError(error) {
            trigger(SwEvent.Error, error, this.uuid);
        }
        _onSocketOpen() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        _onSocketCloseOrError(event) {
            logger.error(`Socket ${event.type} ${event.message}`);
            if (this.relayProtocol) {
                deRegisterAll(this.relayProtocol);
            }
            for (const sub in this.subscriptions) {
                deRegisterAll(sub);
            }
            this.subscriptions = {};
            this.contexts = [];
            if (this._autoReconnect) {
                this._reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay);
            }
        }
        _onSocketMessage(response) { }
        _removeSubscription(protocol, channel) {
            if (!this._existsSubscription(protocol, channel)) {
                return;
            }
            if (channel) {
                delete this.subscriptions[protocol][channel];
                deRegister(protocol, null, channel);
            }
            else {
                delete this.subscriptions[protocol];
                deRegisterAll(protocol);
            }
        }
        _addSubscription(protocol, handler = null, channel) {
            if (this._existsSubscription(protocol, channel)) {
                return;
            }
            if (!this._existsSubscription(protocol)) {
                this.subscriptions[protocol] = {};
            }
            this.subscriptions[protocol][channel] = {};
            if (isFunction(handler)) {
                register(protocol, handler, channel);
            }
        }
        _existsSubscription(protocol, channel) {
            if (this.subscriptions.hasOwnProperty(protocol)) {
                if (!channel ||
                    (channel && this.subscriptions[protocol].hasOwnProperty(channel))) {
                    return true;
                }
            }
            return false;
        }
        _attachListeners() {
            this._detachListeners();
            this.on(SwEvent.SocketOpen, this._onSocketOpen);
            this.on(SwEvent.SocketClose, this._onSocketCloseOrError);
            this.on(SwEvent.SocketError, this._onSocketCloseOrError);
            this.on(SwEvent.SocketMessage, this._onSocketMessage);
        }
        _detachListeners() {
            this.off(SwEvent.SocketOpen, this._onSocketOpen);
            this.off(SwEvent.SocketClose, this._onSocketCloseOrError);
            this.off(SwEvent.SocketError, this._onSocketCloseOrError);
            this.off(SwEvent.SocketMessage, this._onSocketMessage);
        }
        _emptyExecuteQueues() {
            this._executeQueue.forEach(({ resolve, msg }) => {
                if (typeof msg === 'string') {
                    this.executeRaw(msg);
                }
                else {
                    resolve(this.execute(msg));
                }
            });
        }
        _closeConnection() {
            this._idle = true;
            clearTimeout(this._keepAliveTimeout);
            if (this.connection) {
                this.connection.close();
            }
        }
        _keepAlive() {
            if (this._doKeepAlive !== true) {
                return;
            }
            if (this._pong === false) {
                return this._closeConnection();
            }
            this._pong = false;
            this._keepAliveTimeout = setTimeout(() => this._keepAlive(), KEEPALIVE_INTERVAL);
        }
        static on(eventName, callback) {
            register(eventName, callback);
        }
        static off(eventName) {
            deRegister(eventName);
        }
        static uuid() {
            return v4();
        }
        clearConnection() {
            this.connection = null;
        }
        hasAutoReconnect() {
            return this._autoReconnect;
        }
    }

    const RTCPeerConnection = (config) => new window.RTCPeerConnection(config);
    const getUserMedia = (constraints) => navigator.mediaDevices.getUserMedia(constraints);
    const getDisplayMedia = (constraints) => navigator.mediaDevices.getDisplayMedia(constraints);
    const getSupportedConstraints = () => navigator.mediaDevices.getSupportedConstraints();
    const streamIsValid = (stream) => stream && stream instanceof MediaStream;
    const attachMediaStream = (tag, stream) => {
        const element = findElementByType(tag);
        if (element === null) {
            return;
        }
        if (!element.getAttribute('autoplay')) {
            element.setAttribute('autoplay', 'autoplay');
        }
        if (!element.getAttribute('playsinline')) {
            element.setAttribute('playsinline', 'playsinline');
        }
        console.log('attachMediaStream===>element', element);
        console.log('attachMediaStream===>stream', stream);
        element.srcObject = stream;
    };
    const muteMediaElement = (tag) => {
        const element = findElementByType(tag);
        if (element) {
            element.muted = true;
        }
    };
    const setMediaElementSinkId = (tag, deviceId) => __awaiter(void 0, void 0, void 0, function* () {
        const element = findElementByType(tag);
        if (element === null) {
            logger.info('No HTMLMediaElement to attach the speakerId');
            return false;
        }
        if (typeof deviceId !== 'string') {
            logger.info(`Invalid speaker deviceId: '${deviceId}'`);
            return false;
        }
        try {
            yield element.setSinkId(deviceId);
            return true;
        }
        catch (error) {
            return false;
        }
    });
    const sdpToJsonHack = (sdp) => sdp;
    const stopTrack = (track) => {
        if (track && track.readyState === 'live') {
            track.stop();
        }
    };
    const stopStream = (stream) => {
        if (streamIsValid(stream)) {
            stream.getTracks().forEach(stopTrack);
        }
        stream = null;
    };

    const getUserMedia$1 = (constraints) => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('RTCService.getUserMedia', constraints);
        const { audio, video } = constraints;
        if (!audio && !video) {
            return null;
        }
        try {
            return yield getUserMedia(constraints);
        }
        catch (error) {
            logger.error('getUserMedia error: ', error);
            throw error;
        }
    });
    const _constraintsByKind = (kind = null) => {
        return {
            audio: !kind || kind === DeviceType.AudioIn || kind === DeviceType.AudioOut,
            video: !kind || kind === DeviceType.Video,
        };
    };
    const getDevices = (kind = null, fullList = false) => __awaiter(void 0, void 0, void 0, function* () {
        let devices = [];
        const stream = yield navigator.mediaDevices
            .getUserMedia(_constraintsByKind(kind))
            .catch((error) => {
            console.error(error);
            return null;
        });
        if (stream) {
            stopStream(stream);
            devices = yield navigator.mediaDevices.enumerateDevices();
            if (kind) {
                devices = devices.filter((d) => d.kind === kind);
            }
            if (fullList === true) {
                return devices;
            }
            const found = [];
            devices = devices.filter((item) => {
                if (!item.groupId) {
                    return true;
                }
                const key = `${item.kind}-${item.groupId}`;
                if (!found.includes(key)) {
                    found.push(key);
                    return true;
                }
                return false;
            });
        }
        return devices;
    });
    const resolutionList = [
        [320, 240],
        [640, 360],
        [640, 480],
        [1280, 720],
        [1920, 1080],
    ];
    const scanResolutions = (deviceId) => __awaiter(void 0, void 0, void 0, function* () {
        const supported = [];
        const stream = yield getUserMedia$1({
            video: { deviceId: { exact: deviceId } },
        });
        const videoTrack = stream.getVideoTracks()[0];
        for (let i = 0; i < resolutionList.length; i++) {
            const [width, height] = resolutionList[i];
            const success = yield videoTrack
                .applyConstraints({ width: { exact: width }, height: { exact: height } })
                .then(() => true)
                .catch(() => false);
            if (success) {
                supported.push({ resolution: `${width}x${height}`, width, height });
            }
        }
        stopStream(stream);
        return supported;
    });
    const getMediaConstraints = (options) => __awaiter(void 0, void 0, void 0, function* () {
        let { audio = true, micId } = options;
        const { micLabel = '' } = options;
        if (micId) {
            micId = yield assureDeviceId(micId, micLabel, DeviceType.AudioIn).catch((error) => null);
            if (micId) {
                if (typeof audio === 'boolean') {
                    audio = {};
                }
                audio.deviceId = { exact: micId };
            }
        }
        let { video = false, camId } = options;
        const { camLabel = '' } = options;
        if (camId) {
            camId = yield assureDeviceId(camId, camLabel, DeviceType.Video).catch((error) => null);
            if (camId) {
                if (typeof video === 'boolean') {
                    video = {};
                }
                video.deviceId = { exact: camId };
            }
        }
        return { audio, video };
    });
    const assureDeviceId = (id, label, kind) => __awaiter(void 0, void 0, void 0, function* () {
        const devices = yield getDevices(kind, true);
        for (let i = 0; i < devices.length; i++) {
            const { deviceId, label: deviceLabel } = devices[i];
            if (id === deviceId || label === deviceLabel) {
                return deviceId;
            }
        }
        return null;
    });
    const removeUnsupportedConstraints = (constraints) => {
        const supported = getSupportedConstraints();
        Object.keys(constraints).map((key) => {
            if (!supported.hasOwnProperty(key) ||
                constraints[key] === null ||
                constraints[key] === undefined) {
                delete constraints[key];
            }
        });
    };
    const checkDeviceIdConstraints = (id, label, kind, constraints) => __awaiter(void 0, void 0, void 0, function* () {
        const { deviceId } = constraints;
        if (!isDefined(deviceId) && (id || label)) {
            const deviceId = yield assureDeviceId(id, label, kind).catch((error) => null);
            if (deviceId) {
                constraints.deviceId = { exact: deviceId };
            }
        }
        return constraints;
    });
    const sdpStereoHack = (sdp) => {
        const endOfLine = '\r\n';
        const sdpLines = sdp.split(endOfLine);
        const opusIndex = sdpLines.findIndex((s) => /^a=rtpmap/.test(s) && /opus\/48000/.test(s));
        if (opusIndex < 0) {
            return sdp;
        }
        const getCodecPayloadType = (line) => {
            const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
            const result = line.match(pattern);
            return result && result.length == 2 ? result[1] : null;
        };
        const opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        const pattern = new RegExp(`a=fmtp:${opusPayload}`);
        const fmtpLineIndex = sdpLines.findIndex((s) => pattern.test(s));
        if (fmtpLineIndex >= 0) {
            if (!/stereo=1;/.test(sdpLines[fmtpLineIndex])) {
                sdpLines[fmtpLineIndex] += '; stereo=1; sprop-stereo=1';
            }
        }
        else {
            sdpLines[opusIndex] += `${endOfLine}a=fmtp:${opusPayload} stereo=1; sprop-stereo=1`;
        }
        return sdpLines.join(endOfLine);
    };
    const _isAudioLine = (line) => /^m=audio/.test(line);
    const _isVideoLine = (line) => /^m=video/.test(line);
    const sdpMediaOrderHack = (answer, localOffer) => {
        const endOfLine = '\r\n';
        const offerLines = localOffer.split(endOfLine);
        const offerAudioIndex = offerLines.findIndex(_isAudioLine);
        const offerVideoIndex = offerLines.findIndex(_isVideoLine);
        if (offerAudioIndex < offerVideoIndex) {
            return answer;
        }
        const answerLines = answer.split(endOfLine);
        const answerAudioIndex = answerLines.findIndex(_isAudioLine);
        const answerVideoIndex = answerLines.findIndex(_isVideoLine);
        const audioLines = answerLines.slice(answerAudioIndex, answerVideoIndex);
        const videoLines = answerLines.slice(answerVideoIndex, answerLines.length - 1);
        const beginLines = answerLines.slice(0, answerAudioIndex);
        return [...beginLines, ...videoLines, ...audioLines, ''].join(endOfLine);
    };
    const checkSubscribeResponse = (response, channel) => {
        if (!response) {
            return false;
        }
        const { subscribed, alreadySubscribed } = destructSubscribeResponse(response);
        return subscribed.includes(channel) || alreadySubscribed.includes(channel);
    };
    const destructSubscribeResponse = (response) => {
        const tmp = {
            subscribed: [],
            alreadySubscribed: [],
            unauthorized: [],
            unsubscribed: [],
            notSubscribed: [],
        };
        Object.keys(tmp).forEach((k) => {
            tmp[k] = response[`${k}Channels`] || [];
        });
        return tmp;
    };
    const _updateMediaStreamTracks = (stream, kind = null, enabled = null) => {
        if (!streamIsValid(stream)) {
            return null;
        }
        let tracks = [];
        switch (kind) {
            case 'audio':
                tracks = stream.getAudioTracks();
                break;
            case 'video':
                tracks = stream.getVideoTracks();
                break;
            default:
                tracks = stream.getTracks();
                break;
        }
        tracks.forEach((track) => {
            switch (enabled) {
                case 'on':
                case true:
                    track.enabled = true;
                    break;
                case 'off':
                case false:
                    track.enabled = false;
                    break;
                default:
                    track.enabled = !track.enabled;
                    break;
            }
        });
    };
    const enableAudioTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'audio', true);
    };
    const disableAudioTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'audio', false);
    };
    const toggleAudioTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'audio', null);
    };
    const enableVideoTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'video', true);
    };
    const disableVideoTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'video', false);
    };
    const toggleVideoTracks = (stream) => {
        _updateMediaStreamTracks(stream, 'video', null);
    };
    const sdpBitrateHack = (sdp, max, min, start) => {
        const endOfLine = '\r\n';
        const lines = sdp.split(endOfLine);
        lines.forEach((line, i) => {
            if (/^a=fmtp:\d*/.test(line)) {
                lines[i] += `;x-google-max-bitrate=${max};x-google-min-bitrate=${min};x-google-start-bitrate=${start}`;
            }
            else if (/^a=mid:(1|video)/.test(line)) {
                lines[i] += `\r\nb=AS:${max}`;
            }
        });
        return lines.join(endOfLine);
    };
    const sdpBitrateASHack = (sdp, bandwidthKbps) => {
        let modifier = 'AS';
        let bandwidth = bandwidthKbps;
        if (navigator.userAgent.match(/firefox/gim) &&
            !navigator.userAgent.match(/OPR\/[0-9]{2}/gi) &&
            !navigator.userAgent.match(/edg/gim)) {
            const BITS_PER_KILOBITS = 1000;
            modifier = 'TIAS';
            bandwidth = (bandwidthKbps >>> 0) * BITS_PER_KILOBITS;
        }
        if (sdp.indexOf('b=' + modifier + ':') === -1) {
            sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
        }
        else {
            sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
        }
        return sdp;
    };
    function getBrowserInfo() {
        if (!window || !window.navigator || !window.navigator.userAgent) {
            throw new Error('You should use @telnyx/webrtc in a web browser such as Chrome|Firefox|Safari');
        }
        if (navigator.userAgent.match(/chrom(e|ium)/gim) &&
            !navigator.userAgent.match(/OPR\/[0-9]{2}/gi) &&
            !navigator.userAgent.match(/edg/gim)) {
            const info = navigator.userAgent
                .match(/chrom(e|ium)\/[0-9]+\./gim)[0]
                .split('/');
            const name = info[0];
            const version = parseInt(info[1], 10);
            return {
                browserInfo: navigator.userAgent,
                name,
                version,
                supportAudio: true,
                supportVideo: true,
            };
        }
        if (navigator.userAgent.match(/firefox/gim) &&
            !navigator.userAgent.match(/OPR\/[0-9]{2}/gi) &&
            !navigator.userAgent.match(/edg/gim)) {
            const info = navigator.userAgent
                .match(/firefox\/[0-9]+\./gim)[0]
                .split('/');
            const name = info[0];
            const version = parseInt(info[1], 10);
            return {
                browserInfo: navigator.userAgent,
                name,
                version,
                supportAudio: true,
                supportVideo: false,
            };
        }
        if (navigator.userAgent.match(/safari/gim) &&
            !navigator.userAgent.match(/OPR\/[0-9]{2}/gi) &&
            !navigator.userAgent.match(/edg/gim)) {
            const name = navigator.userAgent.match(/safari/gim)[0];
            const fullVersion = navigator.userAgent
                .match(/version\/[0-9]+\./gim)[0]
                .split('/');
            const version = parseInt(fullVersion[1], 10);
            return {
                browserInfo: navigator.userAgent,
                name,
                version,
                supportAudio: true,
                supportVideo: true,
            };
        }
        if (navigator.userAgent.match(/edg/gim) &&
            !navigator.userAgent.match(/OPR\/[0-9]{2}/gi)) {
            const info = navigator.userAgent.match(/edg\/[0-9]+\./gim)[0].split('/');
            const name = info[0];
            const version = parseInt(info[1], 10);
            return {
                browserInfo: navigator.userAgent,
                name,
                version,
                supportAudio: true,
                supportVideo: true,
            };
        }
        throw new Error('This browser does not support @telnyx/webrtc. To see browser support list: `TelnyxRTC.webRTCSupportedBrowserList()`');
    }
    function getWebRTCInfo() {
        try {
            const { browserInfo, name, version, supportAudio, supportVideo, } = getBrowserInfo();
            const PC = window.RTCPeerConnection;
            const sessionDescription = window.RTCSessionDescription;
            const iceCandidate = window.RTCIceCandidate;
            const mediaDevices = window.navigator && window.navigator.mediaDevices;
            const getUserMediaMethod = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.msGetUserMedia ||
                navigator.mozGetUserMedia;
            return {
                browserInfo,
                browserName: name,
                browserVersion: version,
                supportWebRTC: !!PC &&
                    !!sessionDescription &&
                    !!iceCandidate &&
                    !!mediaDevices &&
                    !!getUserMediaMethod,
                supportWebRTCAudio: supportAudio,
                supportWebRTCVideo: supportVideo,
                supportRTCPeerConnection: !!PC,
                supportSessionDescription: !!sessionDescription,
                supportIceCandidate: !!iceCandidate,
                supportMediaDevices: !!mediaDevices,
                supportGetUserMedia: !!getUserMedia$1,
            };
        }
        catch (error) {
            return error.message;
        }
    }
    var SUPPORTED_WEBRTC;
    (function (SUPPORTED_WEBRTC) {
        SUPPORTED_WEBRTC["not_supported"] = "not supported";
        SUPPORTED_WEBRTC["full"] = "full";
        SUPPORTED_WEBRTC["partial"] = "partial";
    })(SUPPORTED_WEBRTC || (SUPPORTED_WEBRTC = {}));
    function getWebRTCSupportedBrowserList() {
        return [
            {
                operationSystem: 'Android',
                supported: [
                    {
                        browserName: 'Chrome',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    {
                        browserName: 'Firefox',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                    { browserName: 'Safari', supported: SUPPORTED_WEBRTC.not_supported },
                    { browserName: 'Edge', supported: SUPPORTED_WEBRTC.not_supported },
                ],
            },
            {
                operationSystem: 'iOS',
                supported: [
                    {
                        browserName: 'Chrome',
                        supported: SUPPORTED_WEBRTC.not_supported,
                    },
                    { browserName: 'Firefox', supported: SUPPORTED_WEBRTC.not_supported },
                    {
                        browserName: 'Safari',
                        features: ['video', 'audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    { browserName: 'Edge', supported: SUPPORTED_WEBRTC.not_supported },
                ],
            },
            {
                operationSystem: 'Linux',
                supported: [
                    {
                        browserName: 'Chrome',
                        features: ['video', 'audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    {
                        browserName: 'Firefox',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                    { browserName: 'Safari', supported: SUPPORTED_WEBRTC.not_supported },
                    { browserName: 'Edge', supported: SUPPORTED_WEBRTC.not_supported },
                ],
            },
            {
                operationSystem: 'MacOS',
                supported: [
                    {
                        browserName: 'Chrome',
                        features: ['video', 'audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    {
                        browserName: 'Firefox',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                    {
                        browserName: 'Safari',
                        features: ['video', 'audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    {
                        browserName: 'Edge',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                ],
            },
            {
                operationSystem: 'Windows',
                supported: [
                    {
                        browserName: 'Chrome',
                        features: ['video', 'audio'],
                        supported: SUPPORTED_WEBRTC.full,
                    },
                    {
                        browserName: 'Firefox',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                    { browserName: 'Safari', supported: SUPPORTED_WEBRTC.not_supported },
                    {
                        browserName: 'Edge',
                        features: ['audio'],
                        supported: SUPPORTED_WEBRTC.partial,
                    },
                ],
            },
        ];
    }
    function createAudio(file, id) {
        const elementExist = document.getElementById(id);
        if (elementExist) {
            return elementExist;
        }
        if (file && id) {
            const ringAudio = document.createElement('audio');
            ringAudio.id = id;
            ringAudio.loop = true;
            ringAudio.src = file;
            ringAudio.preload = 'auto';
            ringAudio.load();
            document.body.appendChild(ringAudio);
            return ringAudio;
        }
        return null;
    }
    function playAudio(audioElement) {
        if (audioElement) {
            audioElement._playFulfilled = false;
            audioElement._promise = audioElement.play();
            audioElement._promise
                .then(() => {
                audioElement._playFulfilled = true;
            })
                .catch((error) => {
                console.error('playAudio', error);
                audioElement._playFulfilled = true;
            });
        }
    }
    function stopAudio(audioElement) {
        if (!audioElement)
            return;
        if (audioElement._playFulfilled) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        else if (audioElement._promise && audioElement._promise.then) {
            audioElement._promise.then(() => {
                audioElement.pause();
                audioElement.currentTime = 0;
            });
        }
        else {
            setTimeout(() => {
                audioElement.pause();
                audioElement.currentTime = 0;
            }, 1000);
        }
    }

    class BaseMessage {
        buildRequest(params) {
            this.request = Object.assign({ jsonrpc: '2.0', id: v4() }, params);
        }
    }

    const tmpMap = {
        id: 'callID',
        destinationNumber: 'destination_number',
        remoteCallerName: 'remote_caller_id_name',
        remoteCallerNumber: 'remote_caller_id_number',
        callerName: 'caller_id_name',
        callerNumber: 'caller_id_number',
    };
    class BaseRequest extends BaseMessage {
        constructor(params = {}) {
            super();
            if (params.hasOwnProperty('dialogParams')) {
                const _a = params.dialogParams, dialogParams = __rest(_a, ["remoteSdp", "localStream", "remoteStream", "onNotification", "camId", "micId", "speakerId"]);
                for (const key in tmpMap) {
                    if (key && dialogParams.hasOwnProperty(key)) {
                        dialogParams[tmpMap[key]] = dialogParams[key];
                        delete dialogParams[key];
                    }
                }
                params.dialogParams = dialogParams;
            }
            this.buildRequest({ method: this.toString(), params });
        }
    }

    class Login extends BaseRequest {
        constructor(login, passwd, login_token, sessionid, userVariables = {}) {
            super();
            this.method = 'login';
            const params = {
                login,
                passwd,
                login_token,
                userVariables,
                loginParams: {},
            };
            if (sessionid) {
                params.sessid = sessionid;
            }
            this.buildRequest({ method: this.method, params });
        }
    }

    class Result extends BaseRequest {
        constructor(id, method) {
            super();
            this.buildRequest({ id, result: { method } });
        }
    }

    class Invite extends BaseRequest {
        toString() {
            return VertoMethod.Invite;
        }
    }
    class Answer extends BaseRequest {
        toString() {
            return VertoMethod.Answer;
        }
    }
    class Attach extends BaseRequest {
        toString() {
            return VertoMethod.Attach;
        }
    }
    class Bye extends BaseRequest {
        toString() {
            return VertoMethod.Bye;
        }
    }
    class Modify extends BaseRequest {
        toString() {
            return VertoMethod.Modify;
        }
    }
    class Info extends BaseRequest {
        toString() {
            return VertoMethod.Info;
        }
    }
    class Broadcast extends BaseRequest {
        toString() {
            return VertoMethod.Broadcast;
        }
    }
    class Subscribe extends BaseRequest {
        toString() {
            return VertoMethod.Subscribe;
        }
    }
    class Unsubscribe extends BaseRequest {
        toString() {
            return VertoMethod.Unsubscribe;
        }
    }

    class Peer {
        constructor(type, options) {
            this.type = type;
            this.options = options;
            this.onSdpReadyTwice = null;
            this._negotiating = false;
            logger.info('New Peer with type:', this.type, 'Options:', this.options);
            this._constraints = {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            };
            this._sdpReady = this._sdpReady.bind(this);
            this.handleSignalingStateChangeEvent =
                this.handleSignalingStateChangeEvent.bind(this);
            this.handleNegotiationNeededEvent =
                this.handleNegotiationNeededEvent.bind(this);
            this.handleTrackEvent = this.handleTrackEvent.bind(this);
            this.createPeerConnection = this.createPeerConnection.bind(this);
            this._init();
        }
        get isOffer() {
            return this.type === PeerType.Offer;
        }
        get isAnswer() {
            return this.type === PeerType.Answer;
        }
        startNegotiation() {
            this._negotiating = true;
            if (this._isOffer()) {
                this._createOffer();
            }
            else {
                this._createAnswer();
            }
        }
        _logTransceivers() {
            logger.info('Number of transceivers:', this.instance.getTransceivers().length);
            this.instance.getTransceivers().forEach((tr, index) => {
                logger.info(`>> Transceiver [${index}]:`, tr.mid, tr.direction, tr.stopped);
                logger.info(`>> Sender Params [${index}]:`, JSON.stringify(tr.sender.getParameters(), null, 2));
            });
        }
        handleSignalingStateChangeEvent(event) {
            logger.info('signalingState:', this.instance.signalingState);
            switch (this.instance.signalingState) {
                case 'stable':
                    this._negotiating = false;
                    break;
                case 'closed':
                    this.instance = null;
                    break;
                default:
                    this._negotiating = true;
            }
        }
        handleNegotiationNeededEvent() {
            logger.info('Negotiation needed event');
            if (this.instance.signalingState !== 'stable') {
                return;
            }
            this.startNegotiation();
        }
        handleTrackEvent(event) {
            this.options.remoteStream = event.streams[0];
            const { remoteElement, remoteStream, screenShare } = this.options;
            if (screenShare === false) {
                console.log('handleTrackEvent remoteElement', remoteElement);
                console.log('handleTrackEvent remoteStream', remoteStream);
                attachMediaStream(remoteElement, remoteStream);
            }
        }
        createPeerConnection() {
            return __awaiter(this, void 0, void 0, function* () {
                this.instance = RTCPeerConnection(this._config());
                this.instance.onsignalingstatechange = this.handleSignalingStateChangeEvent;
                this.instance.onnegotiationneeded = this.handleNegotiationNeededEvent;
                this.instance.ontrack = this.handleTrackEvent;
                this.instance.addEventListener('track', (event) => {
                    console.log('changing track', event.streams);
                    this.options.remoteStream = event.streams[0];
                });
                this.options.localStream = yield this._retrieveLocalStream().catch((error) => {
                    trigger(SwEvent.MediaError, error, this.options.id);
                    return null;
                });
            });
        }
        _init() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.createPeerConnection();
                const { localElement, localStream = null, screenShare = false, } = this.options;
                if (streamIsValid(localStream)) {
                    const audioTracks = localStream.getAudioTracks();
                    logger.info('Local audio tracks: ', audioTracks);
                    const videoTracks = localStream.getVideoTracks();
                    logger.info('Local video tracks: ', videoTracks);
                    if (this.isOffer && typeof this.instance.addTransceiver === 'function') {
                        audioTracks.forEach((track) => {
                            this.options.userVariables.microphoneLabel = track.label;
                            this.instance.addTransceiver(track, {
                                direction: 'sendrecv',
                                streams: [localStream],
                            });
                        });
                        const transceiverParams = {
                            direction: 'sendrecv',
                            streams: [localStream],
                        };
                        console.debug('Applying video transceiverParams', transceiverParams);
                        videoTracks.forEach((track) => {
                            this.options.userVariables.cameraLabel = track.label;
                            this.instance.addTransceiver(track, transceiverParams);
                        });
                    }
                    else if (typeof this.instance.addTrack === 'function') {
                        audioTracks.forEach((track) => {
                            this.options.userVariables.microphoneLabel = track.label;
                            this.instance.addTrack(track, localStream);
                        });
                        videoTracks.forEach((track) => {
                            this.options.userVariables.cameraLabel = track.label;
                            this.instance.addTrack(track, localStream);
                        });
                    }
                    else {
                        this.instance.addStream(localStream);
                    }
                    if (screenShare === false) {
                        muteMediaElement(localElement);
                        attachMediaStream(localElement, localStream);
                    }
                }
                if (this.isOffer) {
                    if (this.options.negotiateAudio) {
                        this._checkMediaToNegotiate('audio');
                    }
                    if (this.options.negotiateVideo) {
                        this._checkMediaToNegotiate('video');
                    }
                }
                else {
                    this.startNegotiation();
                }
                this._logTransceivers();
            });
        }
        _getSenderByKind(kind) {
            return this.instance
                .getSenders()
                .find(({ track }) => track && track.kind === kind);
        }
        _checkMediaToNegotiate(kind) {
            const sender = this._getSenderByKind(kind);
            if (!sender) {
                const transceiver = this.instance.addTransceiver(kind);
                logger.info('Add transceiver', kind, transceiver);
            }
        }
        _createOffer() {
            if (!this._isOffer()) {
                return;
            }
            this._constraints.offerToReceiveAudio = Boolean(this.options.audio);
            this._constraints.offerToReceiveVideo = Boolean(this.options.video);
            logger.info('_createOffer - this._constraints', this._constraints);
            this.instance
                .createOffer(this._constraints)
                .then(this._setLocalDescription.bind(this))
                .then(this._sdpReady)
                .catch((error) => logger.error('Peer _createOffer error:', error));
        }
        _setRemoteDescription(remoteDescription) {
            if (this.options.useStereo) {
                remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp);
            }
            if (this.instance.localDescription) {
                remoteDescription.sdp = sdpMediaOrderHack(remoteDescription.sdp, this.instance.localDescription.sdp);
            }
            const sessionDescr = sdpToJsonHack(remoteDescription);
            logger.info('REMOTE SDP \n', `Type: ${remoteDescription.type}`, '\n\n', remoteDescription.sdp);
            return this.instance.setRemoteDescription(sessionDescr);
        }
        _createAnswer() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this._isAnswer()) {
                    return;
                }
                if (this.instance.signalingState !== 'stable') {
                    console.log("  - But the signaling state isn't stable, so triggering rollback");
                    yield Promise.all([
                        this.instance.setLocalDescription({ type: 'rollback' }),
                        this.instance.setRemoteDescription({
                            sdp: this.options.remoteSdp,
                            type: PeerType.Offer,
                        }),
                    ]);
                    return;
                }
                yield this._setRemoteDescription({
                    sdp: this.options.remoteSdp,
                    type: PeerType.Offer,
                });
                this._logTransceivers();
                const answer = yield this.instance.createAnswer();
                yield this._setLocalDescription(answer);
            });
        }
        _setLocalDescription(sessionDescription) {
            const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate, mediaSettings, } = this.options;
            if (useStereo) {
                sessionDescription.sdp = sdpStereoHack(sessionDescription.sdp);
            }
            if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
                sessionDescription.sdp = sdpBitrateHack(sessionDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate);
            }
            if (mediaSettings &&
                mediaSettings.useSdpASBandwidthKbps &&
                mediaSettings.sdpASBandwidthKbps !== null) {
                sessionDescription.sdp = sdpBitrateASHack(sessionDescription.sdp, mediaSettings.sdpASBandwidthKbps);
            }
            return this.instance.setLocalDescription(sessionDescription);
        }
        _sdpReady() {
            if (isFunction(this.onSdpReadyTwice)) {
                this.onSdpReadyTwice(this.instance.localDescription);
            }
        }
        _retrieveLocalStream() {
            return __awaiter(this, void 0, void 0, function* () {
                if (streamIsValid(this.options.localStream)) {
                    return this.options.localStream;
                }
                const constraints = yield getMediaConstraints(this.options);
                return getUserMedia$1(constraints);
            });
        }
        _isOffer() {
            return this.type === PeerType.Offer;
        }
        _isAnswer() {
            return this.type === PeerType.Answer;
        }
        _config() {
            const { iceServers = [] } = this.options;
            const config = {
                bundlePolicy: 'max-compat',
                iceServers,
            };
            logger.info('RTC config', config);
            return config;
        }
    }

    const MCULayoutEventHandler = (session, eventData) => {
        const { contentType, canvasType, callID, canvasInfo = null, currentLayerIdx = -1, } = eventData;
        if (canvasInfo && canvasType !== 'mcu-personal-canvas') {
            delete canvasInfo.memberID;
        }
        const data = {
            type: NOTIFICATION_TYPE.conferenceUpdate,
            call: session.calls[callID],
            canvasInfo: _clearCanvasInfo(canvasInfo),
            currentLayerIdx,
        };
        switch (contentType) {
            case 'layer-info': {
                const notification = Object.assign({ action: ConferenceAction.LayerInfo }, data);
                trigger(SwEvent.Notification, notification, session.uuid);
                break;
            }
            case 'layout-info': {
                const notification = Object.assign({ action: ConferenceAction.LayoutInfo }, data);
                trigger(SwEvent.Notification, notification, session.uuid);
                break;
            }
        }
    };
    const _clearCanvasInfo = (canvasInfo) => {
        const tmp = JSON.stringify(canvasInfo)
            .replace(/memberID/g, 'participantId')
            .replace(/ID"/g, 'Id"')
            .replace(/POS"/g, 'Pos"');
        return safeParseJson(tmp);
    };

    var name = "@telnyx/webrtc";
    var version = "2.9.0";
    var description = "Telnyx WebRTC Client";
    var keywords = [
    	"telnyx",
    	"webrtc",
    	"sip",
    	"json-rpc",
    	"soft phone",
    	"freeswitch",
    	"voip",
    	"audio",
    	"video"
    ];
    var main = "lib/bundle.js";
    var module = "lib/bundle.mjs";
    var types = "lib/src/index.d.ts";
    var files = [
    	"lib"
    ];
    var scripts = {
    	build: "rollup -c",
    	watch: "rollup -c --watch",
    	prepare: "yarn build",
    	test: "jest",
    	docs: "typedoc --entryPointStrategy expand ./src",
    	release: "release-it",
    	compile: "../../node_modules/.bin/tsc -w",
    	format: "prettier --write 'src/**/*.ts'",
    	prepublishOnly: "../../node_modules/.bin/pinst --disable",
    	postpublish: "../../node_modules/.bin/pinst --enable"
    };
    var engines = {
    	node: ">=14.x"
    };
    var author = "Telnyx <support@telnyx.com> (https://www.telnyx.com/)";
    var repository = {
    	type: "git",
    	url: "git://github.com/team-telnyx/webrtc.git"
    };
    var license = "MIT";
    var dependencies = {
    	loglevel: "^1.6.8",
    	uuid: "^7.0.3"
    };
    var devDependencies = {
    	"@babel/preset-env": "^7.11.0",
    	"@release-it/bumper": "^2.0.0",
    	"@release-it/conventional-changelog": "^3.3.0",
    	"@rollup/plugin-json": "^4.1.0",
    	"@types/jest": "^26.0.20",
    	"@types/node": "20.9.2",
    	"@types/uuid": "^7.0.0",
    	"@types/webrtc": "^0.0.40",
    	"@typescript-eslint/eslint-plugin": "^3.6.1",
    	"@typescript-eslint/parser": "^3.6.1",
    	"babel-jest": "^26.6.3",
    	"core-js": "^3.8.3",
    	eslint: "^8.3.0",
    	"eslint-config-airbnb-base": "^14.2.0",
    	"eslint-plugin-import": "^2.22.1",
    	events: "^3.0.0",
    	husky: "^7.0.0",
    	jest: "^26.6.3",
    	"lint-staged": "^10.2.11",
    	"md-gum-polyfill": "^1.0.0",
    	pinst: "^2.1.6",
    	prettier: "^2.1.2",
    	"release-it": "^14.11.8",
    	rollup: "^1.19.4",
    	"rollup-plugin-babel": "^4.3.3",
    	"rollup-plugin-commonjs": "^10.0.2",
    	"rollup-plugin-node-resolve": "^5.2.0",
    	"rollup-plugin-terser": "^7.0.0",
    	"rollup-plugin-typescript2": "^0.24.0",
    	"ts-jest": "^26.5.4",
    	typedoc: "^0.24",
    	"typedoc-plugin-markdown": "^3.15",
    	"typedoc-plugin-merge-modules": "^3.0.2"
    };
    var publishConfig = {
    	access: "public",
    	"@telnyx:registry": "https://registry.npmjs.org"
    };
    var pkg = {
    	name: name,
    	version: version,
    	description: description,
    	keywords: keywords,
    	main: main,
    	module: module,
    	types: types,
    	files: files,
    	scripts: scripts,
    	engines: engines,
    	author: author,
    	repository: repository,
    	"bugs:": "https://github.com/team-telnyx/webrtc/issues",
    	license: license,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	publishConfig: publishConfig,
    	"release-it": {
    	npm: {
    		publish: false
    	},
    	plugins: {
    		"@release-it/conventional-changelog": {
    			preset: "conventionalcommits",
    			infile: "CHANGELOG.md"
    		}
    	},
    	git: {
    		commitMessage: "chore: release webrtc ${version}",
    		tagAnnotation: "Release webrtc ${version}",
    		tagName: "webrtc/v${version}"
    	},
    	github: {
    		release: true,
    		releaseName: "webrtc@${version}",
    		releaseNotes: "git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:'%s' | grep -i -E '^(feat|fix|docs|refactor|chore)'"
    	}
    },
    	"lint-staged": {
    	"*.js, *.jsx, *.ts, *.tsx": [
    		"eslint --fix"
    	]
    }
    };

    const SDK_VERSION = pkg.version;
    class BaseCall {
        constructor(session, opts) {
            this.session = session;
            this.id = '';
            this.state = State[State.New];
            this.prevState = '';
            this.channels = [];
            this.role = Role.Participant;
            this.extension = null;
            this._state = State.New;
            this._prevState = State.New;
            this.gotAnswer = false;
            this.gotEarly = false;
            this._lastSerno = 0;
            this._targetNodeId = null;
            this._iceTimeout = null;
            this._iceDone = false;
            this._statsBindings = [];
            this._statsIntervalId = null;
            this._checkConferenceSerno = (serno) => {
                const check = serno < 0 ||
                    !this._lastSerno ||
                    (this._lastSerno && serno === this._lastSerno + 1);
                if (check && serno >= 0) {
                    this._lastSerno = serno;
                }
                return check;
            };
            this._doStats = () => {
                if (!this.peer || !this.peer.instance) {
                    return;
                }
                if (this._statsBindings.length === 0) {
                    return;
                }
                this.peer.instance.getStats().then((res) => {
                    res.forEach((report) => {
                        this._statsBindings.forEach((binding) => {
                            if (!binding.callback) {
                                return;
                            }
                            if (binding.constraints) {
                                for (var key in binding.constraints) {
                                    if (binding.constraints.hasOwnProperty(key) &&
                                        binding.constraints[key] !== report[key]) {
                                        return;
                                    }
                                }
                            }
                            binding.callback(report);
                        });
                    });
                });
            };
            const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video }, ringtoneFile, ringbackFile, } = session;
            this.options = Object.assign({}, DEFAULT_CALL_OPTIONS, {
                audio,
                video,
                iceServers,
                localElement,
                remoteElement,
                micId,
                micLabel,
                camId,
                camLabel,
                speakerId,
                ringtoneFile,
                ringbackFile,
            }, opts);
            this._onMediaError = this._onMediaError.bind(this);
            this._init();
            if (this.options) {
                this._ringtone = createAudio(this.options.ringtoneFile, '_ringtone');
                this._ringback = createAudio(this.options.ringbackFile, '_ringback');
            }
        }
        get nodeId() {
            return this._targetNodeId;
        }
        set nodeId(what) {
            this._targetNodeId = what;
        }
        get telnyxIDs() {
            return {
                telnyxCallControlId: this.options.telnyxCallControlId,
                telnyxSessionId: this.options.telnyxSessionId,
                telnyxLegId: this.options.telnyxLegId,
            };
        }
        get localStream() {
            return this.options.localStream;
        }
        get remoteStream() {
            return this.options.remoteStream;
        }
        get memberChannel() {
            return `conference-member.${this.id}`;
        }
        invite() {
            this.direction = Direction.Outbound;
            this.peer = new Peer(PeerType.Offer, this.options);
            this._registerPeerEvents();
        }
        answer() {
            this.stopRingtone();
            this.direction = Direction.Inbound;
            this.peer = new Peer(PeerType.Answer, this.options);
            this._registerPeerEvents();
        }
        playRingtone() {
            playAudio(this._ringtone);
        }
        stopRingtone() {
            stopAudio(this._ringtone);
        }
        playRingback() {
            playAudio(this._ringback);
        }
        stopRingback() {
            stopAudio(this._ringback);
        }
        hangup(hangupParams, hangupExecute) {
            let params = hangupParams || {};
            let execute = hangupExecute === false ? false : true;
            this.cause = params.cause || 'NORMAL_CLEARING';
            this.causeCode = params.causeCode || 16;
            this.sipCode = params.sipCode || null;
            this.sipReason = params.sipReason || null;
            this.sipCallId = params.sip_call_id || null;
            this.setState(State.Hangup);
            const _close = () => {
                this.peer ? this.peer.instance.close() : null;
                this.setState(State.Destroy);
            };
            this.stopRingtone();
            if (execute) {
                const bye = new Bye({
                    sessid: this.session.sessionid,
                    dialogParams: this.options,
                    cause: 'USER_BUSY',
                    causeCode: 17,
                });
                this._execute(bye)
                    .catch((error) => {
                    logger.error('telnyl_rtc.bye failed!', error);
                    trigger(SwEvent.Error, error, this.session.uuid);
                })
                    .then(_close.bind(this));
            }
            else {
                _close();
            }
        }
        transfer(destination) {
            console.warn('The call.transfer method is not currently implemented.');
            const msg = new Modify({
                sessid: this.session.sessionid,
                action: 'transfer',
                destination,
                dialogParams: this.options,
            });
            this._execute(msg);
        }
        replace(replaceCallID) {
            const msg = new Modify({
                sessid: this.session.sessionid,
                action: 'replace',
                replaceCallID,
                dialogParams: this.options,
            });
            this._execute(msg);
        }
        hold() {
            const msg = new Modify({
                sessid: this.session.sessionid,
                action: 'hold',
                dialogParams: this.options,
            });
            return this._execute(msg)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
        }
        unhold() {
            const msg = new Modify({
                sessid: this.session.sessionid,
                action: 'unhold',
                dialogParams: this.options,
            });
            return this._execute(msg)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
        }
        toggleHold() {
            const msg = new Modify({
                sessid: this.session.sessionid,
                action: 'toggleHold',
                dialogParams: this.options,
            });
            return this._execute(msg)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
        }
        dtmf(dtmf) {
            const msg = new Info({
                sessid: this.session.sessionid,
                dtmf,
                dialogParams: this.options,
            });
            this._execute(msg);
        }
        message(to, body) {
            const msg = { from: this.session.options.login, to, body };
            const info = new Info({
                sessid: this.session.sessionid,
                msg,
                dialogParams: this.options,
            });
            this._execute(info);
        }
        muteAudio() {
            disableAudioTracks(this.options.localStream);
        }
        unmuteAudio() {
            enableAudioTracks(this.options.localStream);
        }
        toggleAudioMute() {
            toggleAudioTracks(this.options.localStream);
        }
        setAudioInDevice(deviceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { instance } = this.peer;
                const sender = instance
                    .getSenders()
                    .find(({ track: { kind } }) => kind === 'audio');
                if (sender) {
                    const newStream = yield getUserMedia({
                        audio: { deviceId: { exact: deviceId } },
                    });
                    const audioTrack = newStream.getAudioTracks()[0];
                    sender.replaceTrack(audioTrack);
                    this.options.micId = deviceId;
                    const { localStream } = this.options;
                    localStream.getAudioTracks().forEach((t) => t.stop());
                    localStream.getVideoTracks().forEach((t) => newStream.addTrack(t));
                    this.options.localStream = newStream;
                }
            });
        }
        muteVideo() {
            disableVideoTracks(this.options.localStream);
        }
        unmuteVideo() {
            enableVideoTracks(this.options.localStream);
        }
        toggleVideoMute() {
            toggleVideoTracks(this.options.localStream);
        }
        setVideoDevice(deviceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { instance } = this.peer;
                const sender = instance
                    .getSenders()
                    .find(({ track: { kind } }) => kind === 'video');
                if (sender) {
                    const newStream = yield getUserMedia({
                        video: { deviceId: { exact: deviceId } },
                    });
                    const videoTrack = newStream.getVideoTracks()[0];
                    sender.replaceTrack(videoTrack);
                    const { localElement, localStream } = this.options;
                    attachMediaStream(localElement, newStream);
                    this.options.camId = deviceId;
                    localStream.getAudioTracks().forEach((t) => newStream.addTrack(t));
                    localStream.getVideoTracks().forEach((t) => t.stop());
                    this.options.localStream = newStream;
                }
            });
        }
        deaf() {
            disableAudioTracks(this.options.remoteStream);
        }
        undeaf() {
            enableAudioTracks(this.options.remoteStream);
        }
        toggleDeaf() {
            toggleAudioTracks(this.options.remoteStream);
        }
        setBandwidthEncodingsMaxBps(max, _kind) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this || !this.peer) {
                    logger.error('Could not set bandwidth (reason: no peer connection). Dynamic bandwidth can only be set when there is a call running - is there any call running?)');
                    return;
                }
                const { instance } = this.peer;
                const senders = instance.getSenders();
                if (!senders) {
                    logger.error('Could not set bandwidth (reason: no senders). Dynamic bandwidth can only be set when there is a call running - is there any call running?)');
                    return;
                }
                const sender = senders.find(({ track: { kind } }) => kind === _kind);
                if (sender) {
                    let p = sender.getParameters();
                    const parameters = p;
                    if (!parameters.encodings) {
                        parameters.encodings = [{ rid: 'h' }];
                    }
                    logger.info('Parameters: ', parameters);
                    logger.info('Setting max ', _kind === 'audio' ? 'audio' : 'video', ' bandwidth to: ', max, ' [bps]');
                    parameters.encodings[0].maxBitrate = max;
                    yield sender
                        .setParameters(parameters)
                        .then(() => {
                        logger.info(_kind === 'audio' ? 'New audio' : 'New video', ' bandwidth settings in use: ', sender.getParameters());
                    })
                        .catch((e) => console.error(e));
                }
                else {
                    logger.error('Could not set bandwidth (reason: no ' +
                        _kind +
                        ' sender). Dynamic bandwidth can only be set when there is a call running - is there any call running?)');
                }
            });
        }
        setAudioBandwidthEncodingsMaxBps(max) {
            this.setBandwidthEncodingsMaxBps(max, 'audio');
        }
        setVideoBandwidthEncodingsMaxBps(max) {
            this.setBandwidthEncodingsMaxBps(max, 'video');
        }
        getStats(callback, constraints) {
            if (!callback) {
                return;
            }
            const binding = {
                callback: callback,
                constraints: constraints,
            };
            this._statsBindings.push(binding);
            if (!this._statsIntervalId) {
                const STATS_INTERVAL = 2000;
                this._startStats(STATS_INTERVAL);
            }
        }
        setState(state) {
            this._prevState = this._state;
            this._state = state;
            this.state = State[this._state].toLowerCase();
            this.prevState = State[this._prevState].toLowerCase();
            logger.info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`);
            this._dispatchNotification({
                type: NOTIFICATION_TYPE.callUpdate,
                call: this,
            });
            switch (state) {
                case State.Purge:
                    this.hangup({ cause: 'PURGE', causeCode: '01' }, false);
                    break;
                case State.Active: {
                    setTimeout(() => {
                        const { remoteElement, speakerId } = this.options;
                        if (remoteElement && speakerId) {
                            setMediaElementSinkId(remoteElement, speakerId);
                        }
                    }, 0);
                    break;
                }
                case State.Destroy:
                    this._finalize();
                    break;
            }
        }
        handleMessage(msg) {
            const { method, params } = msg;
            switch (method) {
                case VertoMethod.Answer: {
                    this.gotAnswer = true;
                    if (this._state >= State.Active) {
                        return;
                    }
                    if (this._state >= State.Early) {
                        this.setState(State.Active);
                    }
                    if (!this.gotEarly) {
                        this._onRemoteSdp(params.sdp);
                    }
                    this.stopRingback();
                    this.stopRingtone();
                    break;
                }
                case VertoMethod.Media: {
                    if (this._state >= State.Early) {
                        return;
                    }
                    this.gotEarly = true;
                    this._onRemoteSdp(params.sdp);
                    break;
                }
                case VertoMethod.Display:
                case VertoMethod.Attach: {
                    const { display_name: displayName, display_number: displayNumber, display_direction, } = params;
                    this.extension = displayNumber;
                    const displayDirection = display_direction === Direction.Inbound
                        ? Direction.Outbound
                        : Direction.Inbound;
                    const notification = {
                        type: NOTIFICATION_TYPE[method],
                        call: this,
                        displayName,
                        displayNumber,
                        displayDirection,
                    };
                    if (!trigger(SwEvent.Notification, notification, this.id)) {
                        trigger(SwEvent.Notification, notification, this.session.uuid);
                    }
                    break;
                }
                case VertoMethod.Info:
                case VertoMethod.Event: {
                    const notification = Object.assign(Object.assign({}, params), { type: NOTIFICATION_TYPE.generic, call: this });
                    if (!trigger(SwEvent.Notification, notification, this.id)) {
                        trigger(SwEvent.Notification, notification, this.session.uuid);
                    }
                    break;
                }
                case VertoMethod.Ringing: {
                    this.playRingback();
                    break;
                }
                case VertoMethod.Bye:
                    this.stopRingback();
                    this.stopRingtone();
                    this.hangup(params, false);
                    break;
            }
        }
        handleConferenceUpdate(packet, initialPvtData) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this._checkConferenceSerno(packet.wireSerno) &&
                    packet.name !== initialPvtData.laName) {
                    logger.error('ConferenceUpdate invalid wireSerno or packet name:', packet);
                    return 'INVALID_PACKET';
                }
                const { action, data, hashKey: callId = String(this._lastSerno), arrIndex: index, } = packet;
                switch (action) {
                    case 'bootObj': {
                        this._lastSerno = 0;
                        const { chatChannel, infoChannel, modChannel, laName, conferenceMemberID, role, } = initialPvtData;
                        this._dispatchConferenceUpdate({
                            action: ConferenceAction.Join,
                            conferenceName: laName,
                            participantId: Number(conferenceMemberID),
                            role,
                        });
                        if (chatChannel) {
                            yield this._subscribeConferenceChat(chatChannel);
                        }
                        if (infoChannel) {
                            yield this._subscribeConferenceInfo(infoChannel);
                        }
                        if (modChannel && role === Role.Moderator) {
                            yield this._subscribeConferenceModerator(modChannel);
                        }
                        const participants = [];
                        for (const i in data) {
                            participants.push(Object.assign({ callId: data[i][0], index: Number(i) }, mutateLiveArrayData(data[i][1])));
                        }
                        this._dispatchConferenceUpdate({
                            action: ConferenceAction.Bootstrap,
                            participants,
                        });
                        break;
                    }
                    case 'add': {
                        this._dispatchConferenceUpdate(Object.assign({ action: ConferenceAction.Add, callId,
                            index }, mutateLiveArrayData(data)));
                        break;
                    }
                    case 'modify':
                        this._dispatchConferenceUpdate(Object.assign({ action: ConferenceAction.Modify, callId,
                            index }, mutateLiveArrayData(data)));
                        break;
                    case 'del':
                        this._dispatchConferenceUpdate(Object.assign({ action: ConferenceAction.Delete, callId,
                            index }, mutateLiveArrayData(data)));
                        break;
                    case 'clear':
                        this._dispatchConferenceUpdate({ action: ConferenceAction.Clear });
                        break;
                    default:
                        this._dispatchConferenceUpdate({ action, data, callId, index });
                        break;
                }
            });
        }
        _addChannel(channel) {
            if (!this.channels.includes(channel)) {
                this.channels.push(channel);
            }
            const protocol = this.session.relayProtocol;
            if (this.session._existsSubscription(protocol, channel)) {
                this.session.subscriptions[protocol][channel] = Object.assign(Object.assign({}, this.session.subscriptions[protocol][channel]), { callId: this.id });
            }
        }
        _subscribeConferenceChat(channel) {
            return __awaiter(this, void 0, void 0, function* () {
                const tmp = {
                    nodeId: this.nodeId,
                    channels: [channel],
                    handler: (params) => {
                        const { direction, from: participantNumber, fromDisplay: participantName, message: messageText, type: messageType, } = params.data;
                        this._dispatchConferenceUpdate({
                            action: ConferenceAction.ChatMessage,
                            direction,
                            participantNumber,
                            participantName,
                            messageText,
                            messageType,
                            messageId: params.eventSerno,
                        });
                    },
                };
                const response = yield this.session.vertoSubscribe(tmp).catch((error) => {
                    logger.error('ConfChat subscription error:', error);
                });
                if (checkSubscribeResponse(response, channel)) {
                    this._addChannel(channel);
                    Object.defineProperties(this, {
                        sendChatMessage: {
                            configurable: true,
                            value: (message, type) => {
                                this.session.vertoBroadcast({
                                    nodeId: this.nodeId,
                                    channel,
                                    data: { action: 'send', message, type },
                                });
                            },
                        },
                    });
                }
            });
        }
        _subscribeConferenceInfo(channel) {
            return __awaiter(this, void 0, void 0, function* () {
                const tmp = {
                    nodeId: this.nodeId,
                    channels: [channel],
                    handler: (params) => {
                        const { eventData } = params;
                        switch (eventData.contentType) {
                            case 'layout-info':
                                eventData.callID = this.id;
                                MCULayoutEventHandler(this.session, eventData);
                                break;
                            default:
                                logger.error('Conference-Info unknown contentType', params);
                        }
                    },
                };
                const response = yield this.session.vertoSubscribe(tmp).catch((error) => {
                    logger.error('ConfInfo subscription error:', error);
                });
                if (checkSubscribeResponse(response, channel)) {
                    this._addChannel(channel);
                }
            });
        }
        _confControl(channel, params = {}) {
            const data = Object.assign({ application: 'conf-control', callID: this.id, value: null }, params);
            this.session.vertoBroadcast({ nodeId: this.nodeId, channel, data });
        }
        _subscribeConferenceModerator(channel) {
            return __awaiter(this, void 0, void 0, function* () {
                const _modCommand = (command, memberID = null, value = null) => {
                    const id = parseInt(memberID) || null;
                    this._confControl(channel, { command, id, value });
                };
                const _videoRequired = () => {
                    const { video } = this.options;
                    if ((typeof video === 'boolean' && !video) ||
                        (typeof video === 'object' && objEmpty(video))) {
                        throw `Conference ${this.id} has no video!`;
                    }
                };
                const tmp = {
                    nodeId: this.nodeId,
                    channels: [channel],
                    handler: (params) => {
                        const { data } = params;
                        switch (data['conf-command']) {
                            case 'list-videoLayouts':
                                if (data.responseData) {
                                    const tmp = JSON.stringify(data.responseData).replace(/IDS"/g, 'Ids"');
                                    this._dispatchConferenceUpdate({
                                        action: ConferenceAction.LayoutList,
                                        layouts: JSON.parse(tmp),
                                    });
                                }
                                break;
                            default:
                                this._dispatchConferenceUpdate({
                                    action: ConferenceAction.ModCmdResponse,
                                    command: data['conf-command'],
                                    response: data.response,
                                });
                        }
                    },
                };
                const response = yield this.session.vertoSubscribe(tmp).catch((error) => {
                    logger.error('ConfMod subscription error:', error);
                });
                if (checkSubscribeResponse(response, channel)) {
                    this.role = Role.Moderator;
                    this._addChannel(channel);
                    Object.defineProperties(this, {
                        listVideoLayouts: {
                            configurable: true,
                            value: () => {
                                _modCommand('list-videoLayouts');
                            },
                        },
                        playMedia: {
                            configurable: true,
                            value: (file) => {
                                _modCommand('play', null, file);
                            },
                        },
                        stopMedia: {
                            configurable: true,
                            value: () => {
                                _modCommand('stop', null, 'all');
                            },
                        },
                        deaf: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('deaf', memberID);
                            },
                        },
                        undeaf: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('undeaf', memberID);
                            },
                        },
                        startRecord: {
                            configurable: true,
                            value: (file) => {
                                _modCommand('recording', null, ['start', file]);
                            },
                        },
                        stopRecord: {
                            configurable: true,
                            value: () => {
                                _modCommand('recording', null, ['stop', 'all']);
                            },
                        },
                        snapshot: {
                            configurable: true,
                            value: (file) => {
                                _videoRequired();
                                _modCommand('vid-write-png', null, file);
                            },
                        },
                        setVideoLayout: {
                            configurable: true,
                            value: (layout, canvasID) => {
                                _videoRequired();
                                const value = canvasID ? [layout, canvasID] : layout;
                                _modCommand('vid-layout', null, value);
                            },
                        },
                        kick: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('kick', memberID);
                            },
                        },
                        muteMic: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('tmute', memberID);
                            },
                        },
                        muteVideo: {
                            configurable: true,
                            value: (memberID) => {
                                _videoRequired();
                                _modCommand('tvmute', memberID);
                            },
                        },
                        presenter: {
                            configurable: true,
                            value: (memberID) => {
                                _videoRequired();
                                _modCommand('vid-res-id', memberID, 'presenter');
                            },
                        },
                        videoFloor: {
                            configurable: true,
                            value: (memberID) => {
                                _videoRequired();
                                _modCommand('vid-floor', memberID, 'force');
                            },
                        },
                        banner: {
                            configurable: true,
                            value: (memberID, text) => {
                                _videoRequired();
                                _modCommand('vid-banner', memberID, encodeURI(text));
                            },
                        },
                        volumeDown: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('volume_out', memberID, 'down');
                            },
                        },
                        volumeUp: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('volume_out', memberID, 'up');
                            },
                        },
                        gainDown: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('volume_in', memberID, 'down');
                            },
                        },
                        gainUp: {
                            configurable: true,
                            value: (memberID) => {
                                _modCommand('volume_in', memberID, 'up');
                            },
                        },
                        transfer: {
                            configurable: true,
                            value: (memberID, exten) => {
                                _modCommand('transfer', memberID, exten);
                            },
                        },
                    });
                }
            });
        }
        _handleChangeHoldStateSuccess(response) {
            response.holdState === 'active'
                ? this.setState(State.Active)
                : this.setState(State.Held);
            return true;
        }
        _handleChangeHoldStateError(error) {
            logger.error(`Failed to ${error.action} on call ${this.id}`);
            return false;
        }
        _onRemoteSdp(remoteSdp) {
            let sdp = sdpMediaOrderHack(remoteSdp, this.peer.instance.localDescription.sdp);
            if (this.options.useStereo) {
                sdp = sdpStereoHack(sdp);
            }
            const sessionDescr = sdpToJsonHack({
                sdp,
                type: PeerType.Answer,
            });
            this.peer.instance
                .setRemoteDescription(sessionDescr)
                .then(() => {
                if (this.gotEarly) {
                    this.setState(State.Early);
                }
                if (this.gotAnswer) {
                    this.setState(State.Active);
                }
            })
                .catch((error) => {
                logger.error('Call setRemoteDescription Error: ', error);
                this.hangup();
            });
        }
        _requestAnotherLocalDescription() {
            if (isFunction(this.peer.onSdpReadyTwice)) {
                trigger(SwEvent.Error, new Error('SDP without candidates for the second time!'), this.session.uuid);
                return;
            }
            Object.defineProperty(this.peer, 'onSdpReadyTwice', {
                value: this._onIceSdp.bind(this),
            });
            this._iceDone = false;
            this.peer.startNegotiation();
        }
        _onIceSdp(data) {
            if (this._iceTimeout) {
                clearTimeout(this._iceTimeout);
            }
            this._iceTimeout = null;
            this._iceDone = true;
            const { sdp, type } = data;
            if (sdp.indexOf('candidate') === -1) {
                logger.info('No candidate - retry \n');
                this._requestAnotherLocalDescription();
                return;
            }
            this.peer.instance.removeEventListener('icecandidate', this._onIce);
            let msg = null;
            const tmpParams = {
                sessid: this.session.sessionid,
                sdp,
                dialogParams: this.options,
                'User-Agent': `Web-${SDK_VERSION}`,
            };
            switch (type) {
                case PeerType.Offer:
                    this.setState(State.Requesting);
                    msg = new Invite(tmpParams);
                    break;
                case PeerType.Answer:
                    this.setState(State.Answering);
                    msg =
                        this.options.attach === true
                            ? new Attach(tmpParams)
                            : new Answer(tmpParams);
                    break;
                default:
                    logger.error(`${this.id} - Unknown local SDP type:`, data);
                    return this.hangup({}, false);
            }
            this._execute(msg)
                .then((response) => {
                const { node_id = null } = response;
                this._targetNodeId = node_id;
                type === PeerType.Offer
                    ? this.setState(State.Trying)
                    : this.setState(State.Active);
            })
                .catch((error) => {
                logger.error(`${this.id} - Sending ${type} error:`, error);
                this.hangup();
            });
        }
        _onIce(event) {
            const { instance } = this.peer;
            if (this._iceTimeout === null) {
                this._iceTimeout = setTimeout(() => this._onIceSdp(instance.localDescription), 1000);
            }
            if (event.candidate) {
                logger.debug('RTCPeer Candidate:', event.candidate);
            }
            else {
                this._onIceSdp(instance.localDescription);
            }
        }
        _registerPeerEvents() {
            const { instance } = this.peer;
            this._iceDone = false;
            instance.onicecandidate = (event) => {
                if (this._iceDone) {
                    return;
                }
                this._onIce(event);
            };
            instance.addEventListener('addstream', (event) => {
                this.options.remoteStream = event.stream;
            });
            instance.addEventListener('track', (event) => {
                this.options.remoteStream = event.streams[0];
                const { remoteElement, remoteStream, screenShare } = this.options;
                if (screenShare === false) {
                    console.log('BASE call remoteElement', remoteElement);
                    console.log('BASE call remoteStream', remoteStream);
                    attachMediaStream(remoteElement, remoteStream);
                }
            });
        }
        _onMediaError(error) {
            this._dispatchNotification({
                type: NOTIFICATION_TYPE.userMediaError,
                error,
            });
            this.hangup({}, false);
        }
        _dispatchConferenceUpdate(params) {
            this._dispatchNotification(Object.assign({ type: NOTIFICATION_TYPE.conferenceUpdate, call: this }, params));
        }
        _dispatchNotification(notification) {
            if (this.options.screenShare === true) {
                return;
            }
            if (!trigger(SwEvent.Notification, notification, this.id, false)) {
                trigger(SwEvent.Notification, notification, this.session.uuid);
            }
        }
        _execute(msg) {
            if (this.nodeId) {
                msg.targetNodeId = this.nodeId;
            }
            return this.session.execute(msg);
        }
        _init() {
            const { id, userVariables, remoteCallerNumber, onNotification } = this.options;
            if (!id) {
                this.options.id = v4();
            }
            this.id = this.options.id;
            if (!userVariables || objEmpty(userVariables)) {
                this.options.userVariables = this.session.options.userVariables || {};
            }
            if (!remoteCallerNumber) {
                this.options.remoteCallerNumber = this.options.destinationNumber;
            }
            this.session.calls[this.id] = this;
            register(SwEvent.MediaError, this._onMediaError, this.id);
            if (isFunction(onNotification)) {
                register(SwEvent.Notification, onNotification.bind(this), this.id);
            }
            this.setState(State.New);
            logger.info('New Call with Options:', this.options);
        }
        _finalize() {
            this._stopStats();
            if (this.peer && this.peer.instance) {
                this.peer.instance.close();
                this.peer = null;
            }
            const { remoteStream, localStream } = this.options;
            stopStream(remoteStream);
            stopStream(localStream);
            deRegister(SwEvent.MediaError, null, this.id);
            this.session.calls[this.id] = null;
            delete this.session.calls[this.id];
        }
        _startStats(interval) {
            this._statsIntervalId = setInterval(this._doStats, interval);
            logger.info('Stats started');
        }
        _stopStats() {
            if (this._statsIntervalId) {
                clearInterval(this._statsIntervalId);
                this._statsIntervalId = null;
            }
            logger.info('Stats stopped');
        }
    }
    BaseCall.setStateTelnyx = (call) => {
        if (!call) {
            return;
        }
        switch (call._state) {
            case State.Requesting:
            case State.Recovering:
            case State.Trying:
            case State.Early:
                call.state = 'connecting';
                break;
            case State.Active:
                call.state = 'active';
                break;
            case State.Held:
                call.state = 'held';
                break;
            case State.Hangup:
            case State.Destroy:
                call.state = 'done';
                break;
            case State.Answering:
                call.state = 'ringing';
                break;
            case State.New:
                call.state = 'new';
                break;
        }
        return call;
    };

    class Call extends BaseCall {
        constructor() {
            super(...arguments);
            this._statsInterval = null;
        }
        hangup(params = {}, execute = true) {
            if (this.screenShare instanceof Call) {
                this.screenShare.hangup(params, execute);
            }
            super.hangup(params, execute);
        }
        startScreenShare(opts) {
            return __awaiter(this, void 0, void 0, function* () {
                const displayStream = yield getDisplayMedia({ video: true });
                displayStream.getTracks().forEach((t) => {
                    t.addEventListener('ended', () => {
                        if (this.screenShare) {
                            this.screenShare.hangup();
                        }
                    });
                });
                const { remoteCallerName, remoteCallerNumber, callerName, callerNumber, } = this.options;
                const options = Object.assign({ screenShare: true, localStream: displayStream, destinationNumber: `${this.extension}-screen`, remoteCallerName, remoteCallerNumber: `${remoteCallerNumber}-screen`, callerName: `${callerName} (Screen)`, callerNumber: `${callerNumber} (Screen)` }, opts);
                this.screenShare = new Call(this.session, options);
                this.screenShare.invite();
                return this.screenShare;
            });
        }
        stopScreenShare() {
            if (this.screenShare instanceof Call) {
                this.screenShare.hangup();
            }
        }
        setAudioOutDevice(deviceId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.options.speakerId = deviceId;
                const { remoteElement, speakerId } = this.options;
                if (remoteElement && speakerId) {
                    return setMediaElementSinkId(remoteElement, speakerId);
                }
                return false;
            });
        }
        _finalize() {
            this._stats(false);
            super._finalize();
        }
        _stats(what = true) {
            if (what === false) {
                return clearInterval(this._statsInterval);
            }
            logger.setLevel(2);
            this._statsInterval = window.setInterval(() => __awaiter(this, void 0, void 0, function* () {
                const stats = yield this.peer.instance.getStats(null);
                let statsOutput = '';
                const invalidReport = [
                    'certificate',
                    'codec',
                    'peer-connection',
                    'stream',
                    'local-candidate',
                    'remote-candidate',
                ];
                const invalidStat = ['id', 'type', 'timestamp'];
                stats.forEach((report) => {
                    if (invalidReport.includes(report.type)) {
                        return;
                    }
                    statsOutput += `\n${report.type}\n`;
                    Object.keys(report).forEach((statName) => {
                        if (!invalidStat.includes(statName)) {
                            statsOutput += `\t${statName}: ${report[statName]}\n`;
                        }
                    });
                });
                logger.info(statsOutput);
            }), 2000);
        }
    }

    class BrowserSession extends BaseSession {
        constructor(options) {
            super(options);
            this.calls = {};
            this.autoRecoverCalls = true;
            this._iceServers = [];
            this._localElement = null;
            this._remoteElement = null;
            this._jwtAuth = true;
            this._audioConstraints = true;
            this._videoConstraints = false;
            this._speaker = null;
            this.iceServers = options.iceServers;
            this.ringtoneFile = options.ringtoneFile;
            this.ringbackFile = options.ringbackFile;
        }
        get reconnectDelay() {
            return 1000;
        }
        connect() {
            const _super = Object.create(null, {
                connect: { get: () => super.connect }
            });
            return __awaiter(this, void 0, void 0, function* () {
                this.sessionid = yield sessionStorage.getItem(SESSION_ID);
                _super.connect.call(this);
            });
        }
        checkPermissions(audio = true, video = true) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const stream = yield getUserMedia$1({ audio, video });
                    stopStream(stream);
                    return true;
                }
                catch (_a) {
                    return false;
                }
            });
        }
        logout() {
            this.disconnect();
        }
        disconnect() {
            const _super = Object.create(null, {
                disconnect: { get: () => super.disconnect }
            });
            return __awaiter(this, void 0, void 0, function* () {
                Object.keys(this.calls).forEach((k) => this.calls[k].setState(State.Purge));
                this.calls = {};
                yield _super.disconnect.call(this);
            });
        }
        speedTest(bytes) {
            return new Promise((resolve, reject) => {
                registerOnce(SwEvent.SpeedTest, (speedTestResult) => {
                    const { upDur, downDur } = speedTestResult;
                    const upKps = upDur ? (bytes * 8) / (upDur / 1000) / 1024 : 0;
                    const downKps = downDur ? (bytes * 8) / (downDur / 1000) / 1024 : 0;
                    resolve({
                        upDur,
                        downDur,
                        upKps: upKps.toFixed(0),
                        downKps: downKps.toFixed(0),
                    });
                }, this.uuid);
                bytes = Number(bytes);
                if (!bytes) {
                    return reject(`Invalid parameter 'bytes': ${bytes}`);
                }
                this.executeRaw(`#SPU ${bytes}`);
                let loops = bytes / 1024;
                if (bytes % 1024) {
                    loops++;
                }
                const dots = '.'.repeat(1024);
                for (let i = 0; i < loops; i++) {
                    this.executeRaw(`#SPB ${dots}`);
                }
                this.executeRaw('#SPE');
            });
        }
        getDevices() {
            return getDevices().catch((error) => {
                trigger(SwEvent.MediaError, error, this.uuid);
                return [];
            });
        }
        getVideoDevices() {
            return getDevices(DeviceType.Video).catch((error) => {
                trigger(SwEvent.MediaError, error, this.uuid);
                return [];
            });
        }
        getAudioInDevices() {
            return getDevices(DeviceType.AudioIn).catch((error) => {
                trigger(SwEvent.MediaError, error, this.uuid);
                return [];
            });
        }
        getAudioOutDevices() {
            return getDevices(DeviceType.AudioOut).catch((error) => {
                console.error('getAudioOutDevices', error);
                trigger(SwEvent.MediaError, error, this.uuid);
                return [];
            });
        }
        validateDeviceId(id, label, kind) {
            return assureDeviceId(id, label, kind);
        }
        getDeviceResolutions(deviceId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield scanResolutions(deviceId);
                }
                catch (error) {
                    throw error;
                }
            });
        }
        get mediaConstraints() {
            return { audio: this._audioConstraints, video: this._videoConstraints };
        }
        setAudioSettings(settings) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!settings) {
                    throw new Error('You need to provide the settings object');
                }
                const { micId, micLabel } = settings, constraints = __rest(settings, ["micId", "micLabel"]);
                removeUnsupportedConstraints(constraints);
                this._audioConstraints = yield checkDeviceIdConstraints(micId, micLabel, 'audioinput', constraints);
                this.micId = micId;
                this.micLabel = micLabel;
                return this._audioConstraints;
            });
        }
        disableMicrophone() {
            this._audioConstraints = false;
        }
        enableMicrophone() {
            this._audioConstraints = true;
        }
        setVideoSettings(settings) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!settings) {
                    throw new Error('You need to provide the settings object');
                }
                const { camId, camLabel } = settings, constraints = __rest(settings, ["camId", "camLabel"]);
                removeUnsupportedConstraints(constraints);
                this._videoConstraints = yield checkDeviceIdConstraints(camId, camLabel, 'videoinput', constraints);
                this.camId = camId;
                this.camLabel = camLabel;
                return this._videoConstraints;
            });
        }
        disableWebcam() {
            this._videoConstraints = false;
        }
        enableWebcam() {
            this._videoConstraints = true;
        }
        set iceServers(servers) {
            if (typeof servers === 'boolean') {
                this._iceServers = servers
                    ? [{ urls: ['stun:stun.l.google.com:19302'] }]
                    : [];
            }
            else {
                this._iceServers = servers || [TURN_SERVER, STUN_SERVER];
            }
        }
        get iceServers() {
            return this._iceServers;
        }
        set speaker(deviceId) {
            this._speaker = deviceId;
        }
        get speaker() {
            return this._speaker;
        }
        set localElement(tag) {
            this._localElement = findElementByType(tag);
        }
        get localElement() {
            return this._localElement;
        }
        set remoteElement(tag) {
            this._remoteElement = findElementByType(tag);
        }
        get remoteElement() {
            return this._remoteElement;
        }
        vertoBroadcast({ nodeId, channel: eventChannel = '', data, }) {
            if (!eventChannel) {
                throw new Error(`Invalid channel for broadcast: ${eventChannel}`);
            }
            const msg = new Broadcast({ sessid: this.sessionid, eventChannel, data });
            if (nodeId) {
                msg.targetNodeId = nodeId;
            }
            this.execute(msg).catch((error) => error);
        }
        vertoSubscribe({ nodeId, channels: eventChannel = [], handler, }) {
            return __awaiter(this, void 0, void 0, function* () {
                eventChannel = eventChannel.filter((channel) => channel && !this._existsSubscription(this.relayProtocol, channel));
                if (!eventChannel.length) {
                    return {};
                }
                const msg = new Subscribe({ sessid: this.sessionid, eventChannel });
                if (nodeId) {
                    msg.targetNodeId = nodeId;
                }
                const response = yield this.execute(msg);
                const { unauthorized = [], subscribed = [] } = destructSubscribeResponse(response);
                if (unauthorized.length) {
                    unauthorized.forEach((channel) => this._removeSubscription(this.relayProtocol, channel));
                }
                subscribed.forEach((channel) => this._addSubscription(this.relayProtocol, handler, channel));
                return response;
            });
        }
        vertoUnsubscribe({ nodeId, channels: eventChannel = [], }) {
            return __awaiter(this, void 0, void 0, function* () {
                eventChannel = eventChannel.filter((channel) => channel && this._existsSubscription(this.relayProtocol, channel));
                if (!eventChannel.length) {
                    return {};
                }
                const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel });
                if (nodeId) {
                    msg.targetNodeId = nodeId;
                }
                const response = yield this.execute(msg);
                const { unsubscribed = [], notSubscribed = [] } = destructSubscribeResponse(response);
                unsubscribed.forEach((channel) => this._removeSubscription(this.relayProtocol, channel));
                notSubscribed.forEach((channel) => this._removeSubscription(this.relayProtocol, channel));
                return response;
            });
        }
        static telnyxStateCall(call) {
            return Call.setStateTelnyx(call);
        }
    }

    class Gateway extends BaseRequest {
        constructor() {
            super();
            this.method = VertoMethod.GatewayState;
            const params = {};
            this.buildRequest({ method: this.method, params });
        }
    }

    class ErrorResponse {
        constructor(message, code) {
            this.code = code;
            this.message = message;
        }
    }

    class Ping extends BaseRequest {
        constructor() {
            super();
            this.method = VertoMethod.Ping;
            const params = {};
            this.buildRequest({ method: this.method, params });
        }
    }

    const RETRY_REGISTER_TIME = 5;
    const RETRY_CONNECT_TIME = 5;
    class VertoHandler {
        constructor(session) {
            this.session = session;
        }
        _ack(id, method) {
            const msg = new Result(id, method);
            if (this.nodeId) {
                msg.targetNodeId = this.nodeId;
            }
            this.session.execute(msg);
        }
        reconnectDelay() {
            return randomInt(2, 6) * 1000;
        }
        handleMessage(msg) {
            const { session } = this;
            const { id, method, params = {} } = msg;
            const callID = params === null || params === void 0 ? void 0 : params.callID;
            const eventChannel = params === null || params === void 0 ? void 0 : params.eventChannel;
            const eventType = params === null || params === void 0 ? void 0 : params.eventType;
            const attach = method === VertoMethod.Attach;
            if (eventType === 'channelPvtData') {
                return this._handlePvtEvent(params.pvtData);
            }
            if (callID && session.calls.hasOwnProperty(callID)) {
                if (attach) {
                    session.calls[callID].hangup({}, false);
                }
                else {
                    session.calls[callID].handleMessage(msg);
                    this._ack(id, method);
                    return;
                }
            }
            const _buildCall = () => {
                const callOptions = {
                    id: callID,
                    remoteSdp: params.sdp,
                    destinationNumber: params.callee_id_number,
                    remoteCallerName: params.caller_id_name,
                    remoteCallerNumber: params.caller_id_number,
                    callerName: params.callee_id_name,
                    callerNumber: params.callee_id_number,
                    attach,
                    mediaSettings: params.mediaSettings,
                };
                if (params.telnyx_call_control_id) {
                    callOptions.telnyxCallControlId = params.telnyx_call_control_id;
                }
                if (params.telnyx_session_id) {
                    callOptions.telnyxSessionId = params.telnyx_session_id;
                }
                if (params.telnyx_leg_id) {
                    callOptions.telnyxLegId = params.telnyx_leg_id;
                }
                if (params.client_state) {
                    callOptions.clientState = params.client_state;
                }
                const call = new Call(session, callOptions);
                call.nodeId = this.nodeId;
                return call;
            };
            const messageToCheckRegisterState = new Gateway();
            const messagePing = new Ping();
            switch (method) {
                case VertoMethod.Ping: {
                    this.session.execute(messagePing);
                    break;
                }
                case VertoMethod.Punt:
                    session.disconnect();
                    break;
                case VertoMethod.Invite: {
                    const call = _buildCall();
                    call.playRingtone();
                    call.setState(State.Ringing);
                    this._ack(id, method);
                    break;
                }
                case VertoMethod.Attach: {
                    const call = _buildCall();
                    if (this.session.autoRecoverCalls) {
                        call.answer();
                    }
                    else {
                        call.setState(State.Recovering);
                    }
                    call.handleMessage(msg);
                    break;
                }
                case VertoMethod.Event:
                case 'webrtc.event':
                    if (!eventChannel) {
                        logger.error('Verto received an unknown event:', params);
                        return;
                    }
                    const protocol = session.relayProtocol;
                    const firstValue = eventChannel.split('.')[0];
                    if (session._existsSubscription(protocol, eventChannel)) {
                        trigger(protocol, params, eventChannel);
                    }
                    else if (eventChannel === session.sessionid) {
                        this._handleSessionEvent(params.eventData);
                    }
                    else if (session._existsSubscription(protocol, firstValue)) {
                        trigger(protocol, params, firstValue);
                    }
                    else if (session.calls.hasOwnProperty(eventChannel)) {
                        session.calls[eventChannel].handleMessage(msg);
                    }
                    else {
                        trigger(SwEvent.Notification, params, session.uuid);
                    }
                    break;
                case VertoMethod.Info:
                    params.type = NOTIFICATION_TYPE.generic;
                    trigger(SwEvent.Notification, params, session.uuid);
                    break;
                case VertoMethod.ClientReady:
                    this.session.execute(messageToCheckRegisterState);
                    break;
                default: {
                    const gateWayState = getGatewayState(msg);
                    if (gateWayState) {
                        switch (gateWayState) {
                            case GatewayStateType.REGISTER:
                            case GatewayStateType.REGED: {
                                if (session.connection.previousGatewayState !==
                                    GatewayStateType.REGED &&
                                    session.connection.previousGatewayState !==
                                        GatewayStateType.REGISTER) {
                                    VertoHandler.retriedRegister = 0;
                                    params.type = NOTIFICATION_TYPE.vertoClientReady;
                                    trigger(SwEvent.Ready, params, session.uuid);
                                }
                                break;
                            }
                            case GatewayStateType.UNREGED:
                            case GatewayStateType.NOREG:
                                VertoHandler.retriedRegister += 1;
                                if (VertoHandler.retriedRegister === RETRY_REGISTER_TIME) {
                                    VertoHandler.retriedRegister = 0;
                                    trigger(SwEvent.Error, new ErrorResponse(`Fail to register the user, the server tried ${RETRY_REGISTER_TIME} times`, 'UNREGED|NOREG'), session.uuid);
                                    break;
                                }
                                else {
                                    setTimeout(() => {
                                        this.session.execute(messageToCheckRegisterState);
                                    }, this.reconnectDelay());
                                    break;
                                }
                            case GatewayStateType.FAILED:
                            case GatewayStateType.FAIL_WAIT: {
                                if (session.connection.previousGatewayState !==
                                    GatewayStateType.FAILED &&
                                    session.connection.previousGatewayState !==
                                        GatewayStateType.FAIL_WAIT) {
                                    if (!this.session.hasAutoReconnect()) {
                                        VertoHandler.retriedConnect = 0;
                                        trigger(SwEvent.Error, new ErrorResponse(`Fail to connect the server, the server tried ${RETRY_CONNECT_TIME} times`, 'FAILED|FAIL_WAIT'), session.uuid);
                                        break;
                                    }
                                    VertoHandler.retriedConnect += 1;
                                    if (VertoHandler.retriedConnect === RETRY_CONNECT_TIME) {
                                        VertoHandler.retriedConnect = 0;
                                        trigger(SwEvent.Error, params, session.uuid);
                                        break;
                                    }
                                    else {
                                        setTimeout(() => {
                                            this.session.disconnect().then(() => {
                                                this.session.clearConnection();
                                                this.session.connect();
                                            });
                                        }, this.reconnectDelay());
                                    }
                                }
                                break;
                            }
                            default:
                                logger.warn('GatewayState message unknown method:', msg);
                                break;
                        }
                        break;
                    }
                    logger.warn('Verto message unknown method:', msg);
                    break;
                }
            }
        }
        _retrieveCallId(packet, laChannel) {
            const callIds = Object.keys(this.session.calls);
            if (packet.action === 'bootObj') {
                const me = packet.data.find((pr) => callIds.includes(pr[0]));
                if (me instanceof Array) {
                    return me[0];
                }
            }
            else {
                return callIds.find((id) => this.session.calls[id].channels.includes(laChannel));
            }
        }
        _handlePvtEvent(pvtData) {
            return __awaiter(this, void 0, void 0, function* () {
                const { session } = this;
                const protocol = session.relayProtocol;
                const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role, callID, } = pvtData;
                switch (action) {
                    case 'conference-liveArray-join': {
                        const _liveArrayBootstrap = () => {
                            session.vertoBroadcast({
                                nodeId: this.nodeId,
                                channel: laChannel,
                                data: {
                                    liveArray: {
                                        command: 'bootstrap',
                                        context: laChannel,
                                        name: laName,
                                    },
                                },
                            });
                        };
                        const tmp = {
                            nodeId: this.nodeId,
                            channels: [laChannel],
                            handler: ({ data: packet }) => {
                                const id = callID || this._retrieveCallId(packet, laChannel);
                                if (id && session.calls.hasOwnProperty(id)) {
                                    const call = session.calls[id];
                                    call._addChannel(laChannel);
                                    call.extension = laName;
                                    call.handleConferenceUpdate(packet, pvtData).then((error) => {
                                        if (error === 'INVALID_PACKET') {
                                            _liveArrayBootstrap();
                                        }
                                    });
                                }
                            },
                        };
                        const result = yield session.vertoSubscribe(tmp).catch((error) => {
                            logger.error('liveArray subscription error:', error);
                        });
                        if (checkSubscribeResponse(result, laChannel)) {
                            _liveArrayBootstrap();
                        }
                        break;
                    }
                    case 'conference-liveArray-part': {
                        let call = null;
                        if (laChannel && session._existsSubscription(protocol, laChannel)) {
                            const { callId = null } = session.subscriptions[protocol][laChannel];
                            call = session.calls[callId] || null;
                            if (callId !== null) {
                                const notification = {
                                    type: NOTIFICATION_TYPE.conferenceUpdate,
                                    action: ConferenceAction.Leave,
                                    conferenceName: laName,
                                    participantId: Number(conferenceMemberID),
                                    role,
                                };
                                if (!trigger(SwEvent.Notification, notification, callId, false)) {
                                    trigger(SwEvent.Notification, notification, session.uuid);
                                }
                                if (call === null) {
                                    deRegister(SwEvent.Notification, null, callId);
                                }
                            }
                        }
                        const channels = [laChannel, chatChannel, infoChannel, modChannel];
                        session
                            .vertoUnsubscribe({ nodeId: this.nodeId, channels })
                            .then(({ unsubscribedChannels = [] }) => {
                            if (call) {
                                call.channels = call.channels.filter((c) => !unsubscribedChannels.includes(c));
                            }
                        })
                            .catch((error) => {
                            logger.error('liveArray unsubscribe error:', error);
                        });
                        break;
                    }
                }
            });
        }
        _handleSessionEvent(eventData) {
            switch (eventData.contentType) {
                case 'layout-info':
                case 'layer-info':
                    MCULayoutEventHandler(this.session, eventData);
                    break;
                case 'logo-info': {
                    const notification = {
                        type: NOTIFICATION_TYPE.conferenceUpdate,
                        action: ConferenceAction.LogoInfo,
                        logo: eventData.logoURL,
                    };
                    trigger(SwEvent.Notification, notification, this.session.uuid);
                    break;
                }
            }
        }
    }
    VertoHandler.retriedConnect = 0;
    VertoHandler.retriedRegister = 0;

    const VERTO_PROTOCOL = 'verto-protocol';
    class Verto extends BrowserSession {
        constructor(options) {
            super(options);
            this.relayProtocol = VERTO_PROTOCOL;
            this.timeoutErrorCode = -329990;
            window.addEventListener('beforeunload', (e) => {
                if (this.calls) {
                    Object.keys(this.calls).forEach((callId) => {
                        if (this.calls[callId]) {
                            this.calls[callId].hangup({}, true);
                        }
                    });
                }
            });
        }
        validateOptions() {
            return isValidOptions(this.options);
        }
        newCall(options) {
            if (!options || !options.destinationNumber) {
                throw new Error('Verto.newCall() error: destinationNumber is required.');
            }
            const call = new Call(this, options);
            call.invite();
            return call;
        }
        broadcast(params) {
            return this.vertoBroadcast(params);
        }
        subscribe(params) {
            return this.vertoSubscribe(params);
        }
        unsubscribe(params) {
            return this.vertoUnsubscribe(params);
        }
        _onSocketOpen() {
            return __awaiter(this, void 0, void 0, function* () {
                this._idle = false;
                const { login, password, passwd, login_token, userVariables, autoReconnect = true, } = this.options;
                const msg = new Login(login, password || passwd, login_token, this.sessionid, userVariables);
                const response = yield this.execute(msg).catch(this._handleLoginError);
                if (response) {
                    this._autoReconnect = autoReconnect;
                    this.sessionid = response.sessid;
                    sessionStorage.setItem(SESSION_ID, this.sessionid);
                }
            });
        }
        _onSocketMessage(msg) {
            const handler = new VertoHandler(this);
            handler.handleMessage(msg);
        }
    }

    class TelnyxRTC extends Verto {
        constructor(options) {
            super(options);
            console.log(`SDK version: ${version}`);
        }
        newCall(options) {
            return super.newCall(options);
        }
        static webRTCInfo() {
            return getWebRTCInfo();
        }
        static webRTCSupportedBrowserList() {
            return getWebRTCSupportedBrowserList();
        }
    }

    exports.TelnyxRTC = TelnyxRTC;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
