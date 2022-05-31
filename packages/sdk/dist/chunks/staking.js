import { d as __awaiter, e as __generator, T as Token, g as __read, j as __values, S as SupportedChainId, E as Ether, b as __spreadArray, G as G$ContractAddresses, k as getNetworkEnv, l as NETWORK_LABELS, F as Fraction, a as __assign, m as getCreate2Address, n as UNISWAP_INIT_CODE_HASH, o as keccak256, p as pack, q as UNISWAP_FACTORY_ADDRESSES, P as Pair, C as CurrencyAmount, J as JSBI, r as Percent, s as Trade } from './addresses.js';
import { _ as _isFlattenable, i as isArray_1, a as isArguments_1, b as isBuffer$2, c as isTypedArray_1, d as isFunction_1, e as isLength_1, f as _Stack, h as _equalArrays, j as _equalByTag, k as _getTag, l as isObjectLike_1, m as isObject_1, n as isSymbol_1, o as _baseToString, p as _stringToPath, q as _arrayMap, U as UnsupportedChainId, G as G$, r as GDX, s as GDAO, T as TOKEN_LISTS, F as FUSE, t as debug, u as memoize_1, v as decimalToFraction, w as delayedCacheClear, x as UST, M as MIR, W as WETH9_EXTENDED, D as DAI, y as USDC, z as USDT, A as WBTC, E as ETH2X_FLI, B as UNI, C as UMA, H as FEI, I as TRIBE, J as FRAX, K as FXS, L as renBTC, N as AMPL, O as aaveStaking, P as CDAI, Q as debugGroupEnd, R as debugGroup, g as g$Price } from './apollo.js';
import { A as AddressZero, J as JsonRpcProvider, W as Web3Provider, C as Contract } from './index.js';
import { R as RPC } from './useEnvWeb3.js';

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */

function arrayPush$2(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush$2;

var arrayPush$1 = _arrayPush,
    isFlattenable = _isFlattenable;

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten$1(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush$1(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

var _baseFlatten = baseFlatten$1;

var arrayPush = _arrayPush,
    isArray$7 = isArray_1;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$7(object) ? result : arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys$1;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */

function arrayFilter$1(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter$1;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */

function stubArray$1() {
  return [];
}

var stubArray_1 = stubArray$1;

var arrayFilter = _arrayFilter,
    stubArray = stubArray_1;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

var _getSymbols = getSymbols$1;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */

function baseTimes$1(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes$1;

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex$2(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex$2;

var baseTimes = _baseTimes,
    isArguments$1 = isArguments_1,
    isArray$6 = isArray_1,
    isBuffer$1 = isBuffer$2.exports,
    isIndex$1 = _isIndex,
    isTypedArray$1 = isTypedArray_1;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys$1(value, inherited) {
  var isArr = isArray$6(value),
      isArg = !isArr && isArguments$1(value),
      isBuff = !isArr && !isArg && isBuffer$1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex$1(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys$1;

/** Used for built-in method references. */

var objectProto$3 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype$1(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$3;

  return value === proto;
}

var _isPrototype = isPrototype$1;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */

function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg$1;

var overArg = _overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys$1 = overArg(Object.keys, Object);

var _nativeKeys = nativeKeys$1;

var isPrototype = _isPrototype,
    nativeKeys = _nativeKeys;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys$1(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys$1;

var isFunction = isFunction_1,
    isLength$1 = isLength_1;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike$3(value) {
  return value != null && isLength$1(value.length) && !isFunction(value);
}

var isArrayLike_1 = isArrayLike$3;

var arrayLikeKeys = _arrayLikeKeys,
    baseKeys = _baseKeys,
    isArrayLike$2 = isArrayLike_1;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys$3(object) {
  return isArrayLike$2(object) ? arrayLikeKeys(object) : baseKeys(object);
}

var keys_1 = keys$3;

var baseGetAllKeys = _baseGetAllKeys,
    getSymbols = _getSymbols,
    keys$2 = keys_1;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys$1(object) {
  return baseGetAllKeys(object, keys$2, getSymbols);
}

var _getAllKeys = getAllKeys$1;

var getAllKeys = _getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects$1;

var Stack$1 = _Stack,
    equalArrays = _equalArrays,
    equalByTag = _equalByTag,
    equalObjects = _equalObjects,
    getTag = _getTag,
    isArray$5 = isArray_1,
    isBuffer = isBuffer$2.exports,
    isTypedArray = isTypedArray_1;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$5(object),
      othIsArr = isArray$5(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack$1);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack$1);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack$1);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep$1;

var baseIsEqualDeep = _baseIsEqualDeep,
    isObjectLike = isObjectLike_1;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual$2(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
}

var _baseIsEqual = baseIsEqual$2;

var Stack = _Stack,
    baseIsEqual$1 = _baseIsEqual;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch$1(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

var _baseIsMatch = baseIsMatch$1;

var isObject = isObject_1;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable$2(value) {
  return value === value && !isObject(value);
}

var _isStrictComparable = isStrictComparable$2;

var isStrictComparable$1 = _isStrictComparable,
    keys$1 = keys_1;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData$1(object) {
  var result = keys$1(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable$1(value)];
  }
  return result;
}

var _getMatchData = getMatchData$1;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function matchesStrictComparable$2(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

var _matchesStrictComparable = matchesStrictComparable$2;

var baseIsMatch = _baseIsMatch,
    getMatchData = _getMatchData,
    matchesStrictComparable$1 = _matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches$1(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches$1;

var isArray$4 = isArray_1,
    isSymbol$1 = isSymbol_1;

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey$3(value, object) {
  if (isArray$4(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol$1(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

var _isKey = isKey$3;

var baseToString = _baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$1(value) {
  return value == null ? '' : baseToString(value);
}

var toString_1 = toString$1;

var isArray$3 = isArray_1,
    isKey$2 = _isKey,
    stringToPath = _stringToPath,
    toString = toString_1;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath$2(value, object) {
  if (isArray$3(value)) {
    return value;
  }
  return isKey$2(value, object) ? [value] : stringToPath(toString(value));
}

var _castPath = castPath$2;

var isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey$4(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

var _toKey = toKey$4;

var castPath$1 = _castPath,
    toKey$3 = _toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet$2(object, path) {
  path = castPath$1(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey$3(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

var _baseGet = baseGet$2;

var baseGet$1 = _baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get$1(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet$1(object, path);
  return result === undefined ? defaultValue : result;
}

var get_1 = get$1;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */

function baseHasIn$1(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn$1;

var castPath = _castPath,
    isArguments = isArguments_1,
    isArray$2 = isArray_1,
    isIndex = _isIndex,
    isLength = isLength_1,
    toKey$2 = _toKey;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath$1(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey$2(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray$2(object) || isArguments(object));
}

var _hasPath = hasPath$1;

var baseHasIn = _baseHasIn,
    hasPath = _hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn$1(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

var hasIn_1 = hasIn$1;

var baseIsEqual = _baseIsEqual,
    get = get_1,
    hasIn = hasIn_1,
    isKey$1 = _isKey,
    isStrictComparable = _isStrictComparable,
    matchesStrictComparable = _matchesStrictComparable,
    toKey$1 = _toKey;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty$1(path, srcValue) {
  if (isKey$1(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey$1(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

var _baseMatchesProperty = baseMatchesProperty$1;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */

function identity$1(value) {
  return value;
}

var identity_1 = identity$1;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */

function baseProperty$1(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty$1;

var baseGet = _baseGet;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep$1(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

var _basePropertyDeep = basePropertyDeep$1;

var baseProperty = _baseProperty,
    basePropertyDeep = _basePropertyDeep,
    isKey = _isKey,
    toKey = _toKey;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property$1(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

var property_1 = property$1;

var baseMatches = _baseMatches,
    baseMatchesProperty = _baseMatchesProperty,
    identity = identity_1,
    isArray$1 = isArray_1,
    property = property_1;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee$1(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray$1(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

var _baseIteratee = baseIteratee$1;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */

function createBaseFor$1(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor$1;

var createBaseFor = _createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor$1 = createBaseFor();

var _baseFor = baseFor$1;

var baseFor = _baseFor,
    keys = keys_1;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn$1(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

var _baseForOwn = baseForOwn$1;

var isArrayLike$1 = isArrayLike_1;

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach$1(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike$1(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var _createBaseEach = createBaseEach$1;

var baseForOwn = _baseForOwn,
    createBaseEach = _createBaseEach;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach$1 = createBaseEach(baseForOwn);

var _baseEach = baseEach$1;

var baseEach = _baseEach,
    isArrayLike = isArrayLike_1;

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap$1(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

var _baseMap = baseMap$1;

var arrayMap = _arrayMap,
    baseIteratee = _baseIteratee,
    baseMap = _baseMap,
    isArray = isArray_1;

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map$1(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee));
}

var map_1 = map$1;

var baseFlatten = _baseFlatten,
    map = map_1;

/**
 * Creates a flattened array of values by running each element in `collection`
 * thru `iteratee` and flattening the mapped results. The iteratee is invoked
 * with three arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * function duplicate(n) {
 *   return [n, n];
 * }
 *
 * _.flatMap([1, 2], duplicate);
 * // => [1, 1, 2, 2]
 */
function flatMap(collection, iteratee) {
  return baseFlatten(map(collection, iteratee), 1);
}

var flatMap_1 = flatMap;

/**
 * Returns current chain ID based on web3 instance.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<number>}
 */
function getChainId(web3) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, web3.eth.getChainId()];
        });
    });
}

var _format$4="hh-sol-artifact-1";var contractName$4="ERC20";var sourceName$4="contracts/Interfaces.sol";var abi$5=[{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"amount",type:"uint256"}],name:"Transfer",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"amount",type:"uint256"},{indexed:false,internalType:"bytes",name:"data",type:"bytes"}],name:"Transfer",type:"event"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"addr",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"mintAmount",type:"uint256"}],name:"mint",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"sender",type:"address"},{internalType:"address",name:"recipient",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"}];var bytecode$4="0x";var deployedBytecode$4="0x";var linkReferences$4={};var deployedLinkReferences$4={};var ERC20 = {_format:_format$4,contractName:contractName$4,sourceName:sourceName$4,abi:abi$5,bytecode:bytecode$4,deployedBytecode:deployedBytecode$4,linkReferences:linkReferences$4,deployedLinkReferences:deployedLinkReferences$4};

/**
 * Returns instance of ERC20 contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
function ERC20Contract(web3, address) {
    return new web3.eth.Contract(ERC20.abi, address);
}

var name$1="Uniswap Default List";var timestamp$1="2021-01-21T23:57:10.982Z";var version$1={major:2,minor:0,patch:0};var tags$1={};var logoURI$1="ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir";var keywords$1=["uniswap","default"];var tokens$1=[{chainId:1,address:"0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",name:"Aave",symbol:"AAVE",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110"},{chainId:1,address:"0xfF20817765cB7f73d4bde2e66e067E58D11095C2",name:"Amp",symbol:"AMP",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/12409/thumb/amp-200x200.png?1599625397"},{name:"Aragon Network Token",address:"0x960b236A07cf122663c4303350609A66A7B288C0",symbol:"ANT",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x960b236A07cf122663c4303350609A66A7B288C0/logo.png"},{name:"Balancer",address:"0xba100000625a3754423978a60c9317c58a424e3D",symbol:"BAL",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png"},{chainId:1,address:"0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",name:"Band Protocol",symbol:"BAND",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/9545/thumb/band-protocol.png?1568730326"},{name:"Bancor Network Token",address:"0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",symbol:"BNT",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C/logo.png"},{name:"Compound",address:"0xc00e94Cb662C3520282E6f5717214004A7f26888",symbol:"COMP",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png"},{name:"Curve DAO Token",address:"0xD533a949740bb3306d119CC777fa900bA034cd52",symbol:"CRV",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png"},{chainId:1,address:"0x41e5560054824eA6B0732E656E3Ad64E20e94E45",name:"Civic",symbol:"CVC",decimals:8,logoURI:"https://assets.coingecko.com/coins/images/788/thumb/civic.png?1547034556"},{name:"Dai Stablecoin",address:"0x6B175474E89094C44Da98b954EedeAC495271d0F",symbol:"DAI",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"},{chainId:1,address:"0x0AbdAce70D3790235af448C88547603b945604ea",name:"district0x",symbol:"DNT",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/849/thumb/district0x.png?1547223762"},{name:"Gnosis Token",address:"0x6810e776880C02933D47DB1b9fc05908e5386b96",symbol:"GNO",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png"},{chainId:1,address:"0xc944E90C64B2c07662A292be6244BDf05Cda44a7",name:"The Graph",symbol:"GRT",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/13397/thumb/Graph_Token.png?1608145566"},{chainId:1,address:"0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC",name:"Keep Network",symbol:"KEEP",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/3373/thumb/IuNzUb5b_400x400.jpg?1589526336"},{name:"Kyber Network Crystal",address:"0xdd974D5C2e2928deA5F71b9825b8b646686BD200",symbol:"KNC",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdd974D5C2e2928deA5F71b9825b8b646686BD200/logo.png"},{name:"ChainLink Token",address:"0x514910771AF9Ca656af840dff83E8264EcF986CA",symbol:"LINK",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png"},{name:"Loom Network",address:"0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0",symbol:"LOOM",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0/logo.png"},{name:"LoopringCoin V2",address:"0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD",symbol:"LRC",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png"},{chainId:1,address:"0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",name:"Decentraland",symbol:"MANA",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/878/thumb/decentraland-mana.png?1550108745"},{name:"Maker",address:"0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",symbol:"MKR",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png"},{chainId:1,address:"0xec67005c4E498Ec7f55E092bd1d35cbC47C91892",name:"Melon",symbol:"MLN",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/605/thumb/melon.png?1547034295"},{name:"Numeraire",address:"0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671",symbol:"NMR",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671/logo.png"},{chainId:1,address:"0x4fE83213D56308330EC302a8BD641f1d0113A4Cc",name:"NuCypher",symbol:"NU",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/3318/thumb/photo1198982838879365035.jpg?1547037916"},{name:"Orchid",address:"0x4575f41308EC1483f3d399aa9a2826d74Da13Deb",symbol:"OXT",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4575f41308EC1483f3d399aa9a2826d74Da13Deb/logo.png"},{name:"Republic Token",address:"0x408e41876cCCDC0F92210600ef50372656052a38",symbol:"REN",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x408e41876cCCDC0F92210600ef50372656052a38/logo.png"},{name:"Reputation Augur v1",address:"0x1985365e9f78359a9B6AD760e32412f4a445E862",symbol:"REP",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1985365e9f78359a9B6AD760e32412f4a445E862/logo.png"},{name:"Reputation Augur v2",address:"0x221657776846890989a759BA2973e427DfF5C9bB",symbol:"REPv2",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x221657776846890989a759BA2973e427DfF5C9bB/logo.png"},{name:"Synthetix Network Token",address:"0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",symbol:"SNX",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png"},{name:"Storj Token",address:"0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",symbol:"STORJ",decimals:8,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC/logo.png"},{chainId:1,address:"0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa",name:"tBTC",symbol:"TBTC",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/11224/thumb/tBTC.png?1589620754"},{name:"UMA Voting Token v1",address:"0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",symbol:"UMA",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828/logo.png"},{name:"Uniswap",address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",symbol:"UNI",decimals:18,chainId:1,logoURI:"ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"},{name:"USDCoin",address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",symbol:"USDC",decimals:6,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},{name:"Tether USD",address:"0xdAC17F958D2ee523a2206206994597C13D831ec7",symbol:"USDT",decimals:6,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"},{name:"Wrapped BTC",address:"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",symbol:"WBTC",decimals:8,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"},{name:"Wrapped Ether",address:"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",symbol:"WETH",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"},{chainId:1,address:"0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",name:"yearn finance",symbol:"YFI",decimals:18,logoURI:"https://assets.coingecko.com/coins/images/11849/thumb/yfi-192x192.png?1598325330"},{name:"0x Protocol Token",address:"0xE41d2489571d322189246DaFA5ebDe1F4699F498",symbol:"ZRX",decimals:18,chainId:1,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png"},{name:"Dai Stablecoin",address:"0xaD6D458402F60fD3Bd25163575031ACDce07538D",symbol:"DAI",decimals:18,chainId:3,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaD6D458402F60fD3Bd25163575031ACDce07538D/logo.png"},{name:"Uniswap",address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",symbol:"UNI",decimals:18,chainId:3,logoURI:"ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"},{name:"Wrapped Ether",address:"0xc778417E063141139Fce010982780140Aa0cD5Ab",symbol:"WETH",decimals:18,chainId:3,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png"},{name:"Dai Stablecoin",address:"0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",symbol:"DAI",decimals:18,chainId:4,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735/logo.png"},{name:"Maker",address:"0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",symbol:"MKR",decimals:18,chainId:4,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85/logo.png"},{name:"Uniswap",address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",symbol:"UNI",decimals:18,chainId:4,logoURI:"ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"},{name:"Wrapped Ether",address:"0xc778417E063141139Fce010982780140Aa0cD5Ab",symbol:"WETH",decimals:18,chainId:4,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc778417E063141139Fce010982780140Aa0cD5Ab/logo.png"},{name:"Uniswap",address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",symbol:"UNI",decimals:18,chainId:5,logoURI:"ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"},{name:"Wrapped Ether",address:"0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",symbol:"WETH",decimals:18,chainId:5,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6/logo.png"},{name:"Dai Stablecoin",address:"0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",symbol:"DAI",decimals:18,chainId:42,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa/logo.png"},{name:"Maker",address:"0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD",symbol:"MKR",decimals:18,chainId:42,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD/logo.png"},{name:"Uniswap",address:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",symbol:"UNI",decimals:18,chainId:42,logoURI:"ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"},{name:"Wrapped Ether",address:"0xd0A1E359811322d97991E03f863a0C30C2cF029C",symbol:"WETH",decimals:18,chainId:42,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xd0A1E359811322d97991E03f863a0C30C2cF029C/logo.png"}];var UniswapTokenList = {name:name$1,timestamp:timestamp$1,version:version$1,tags:tags$1,logoURI:logoURI$1,keywords:keywords$1,tokens:tokens$1};

var name="FuseSwap Token List";var timestamp="2021-07-07T17:05:19.835Z";var version={major:2,minor:9,patch:0};var tags={};var logoURI="ipfs://QmQQGd3Kbb8fhxKQLvzPPngzBGd5aydV3QAigLHy53Hr3g";var keywords=["fuseswap","fuse","default"];var tokens=[{name:"BNB on Fuse",address:"0x6acb34b1Df86E254b544189Ec32Cf737e2482058",symbol:"BNB",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xB8c77482e45F1F44dE1745F52C74426C631bDD52/logo.png"},{name:"Dai Stablecoin on Fuse",address:"0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA",symbol:"DAI",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"},{name:"DEXTools on Fuse",address:"0x2f60a843302F1Be3FA87429CA9d684f9091b003c",symbol:"DEXT",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x26CE25148832C04f3d7F26F32478a9fe55197166/logo.png"},{name:"Fuse Dollar",address:"0x249BE57637D8B013Ad64785404b24aeBaE9B098B",symbol:"fUSD",decimals:18,chainId:122,logoURI:"https://fuselogo.s3.eu-central-1.amazonaws.com/fuse-dollar.png"},{name:"GoodDollar",address:"0x495d133B938596C9984d462F007B676bDc57eCEC",symbol:"G$",decimals:2,chainId:122,logoURI:"https://raw.githubusercontent.com/mul53/token-assets/main/assets/etheruem/0x67c5870b4a41d4ebef24d2456547a03f1f3e094b/logo.png"},{name:"Graph Token on Fuse",address:"0x025a4c577198D116Ea499193E6D735FDb2e6E841",symbol:"GRT",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc944E90C64B2c07662A292be6244BDf05Cda44a7/logo.png"},{name:"Kyber Network Crystal on Fuse",address:"0x43B17749B246fd2a96DE25d9e4184E27E09765b0",symbol:"KNC",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdd974D5C2e2928deA5F71b9825b8b646686BD200/logo.png"},{name:"ChainLink Token on Fuse",address:"0x0972F26e8943679b043de23df2fD3852177A7c48",symbol:"LINK",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png"},{name:"MANTRA DAO on Fuse",address:"0x7F59aE3a787C0d1D640F99883d0e48c22188C54f",symbol:"OM",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x3593D125a4f7849a1B059E64F4517A86Dd60c95d/logo.png"},{name:"USD Coin on Fuse",address:"0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5",symbol:"USDC",decimals:6,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},{name:"Tether USD on Fuse",address:"0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10",symbol:"USDT",decimals:6,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"},{name:"Wrapped BTC on Fuse",address:"0x33284f95ccb7B948d9D352e1439561CF83d8d00d",symbol:"WBTC",decimals:8,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"},{name:"Wrapped Ether on Fuse",address:"0xa722c13135930332Eb3d749B2F0906559D2C5b99",symbol:"WETH",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"},{name:"Wrapped Ether on Fuse",address:"0xd8Bf72f3e163B9CF0C73dFdCC316417A5ac20670",symbol:"WETH (Deprecated)",decimals:18,chainId:122,logoURI:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",isDeprecated:true},{name:"Wrapped Fuse",address:"0x0BE9e53fd7EDaC9F859882AfdDa116645287C629",symbol:"WFUSE",decimals:18,chainId:122,logoURI:"https://fuselogo.s3.eu-central-1.amazonaws.com/wfuse.png"}];var FuseTokenList = {name:name,timestamp:timestamp,version:version,tags:tags,logoURI:logoURI,keywords:keywords,tokens:tokens};

var cachedTokens = new Map();
var cachedTokensByAddress = new Map();
/**
 * List of tokens from given url.
 * @see https://tokenlists.org/
 * @param {string} url Url to fetch.
 * @returns {TokenType[]} List of tokens.
 */
function fetchURL(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, fetch(url)
                    .then(function (r) { return r.json(); })
                    .then(function (r) { return r.tokens; })
                    .catch(function (e) {
                    debug(url, e.message);
                    return [];
                })];
        });
    });
}
/**
 * Cache single token.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {Token} token Necessary token.
 */
function cacheToken(supportedChainId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, tokenList, tokenListByAddress;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getTokens(supportedChainId)];
                case 1:
                    _a = __read.apply(void 0, [_b.sent(), 2]), tokenList = _a[0], tokenListByAddress = _a[1];
                    if (!tokenListByAddress || !tokenList) {
                        throw new UnsupportedChainId(supportedChainId);
                    }
                    if (!tokenList.has(token.symbol) && !tokenListByAddress.has(token.address)) {
                        tokenList.set(token.symbol, token);
                        tokenListByAddress.set(token.address, token);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Trying to fetch token from predefined list or fetch it from ERC20 contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Token address.
 * @returns {Token | Currency}
 */
function getTokenByAddress(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var chainId, token, contract, symbol, decimals, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getChainId(web3)];
                case 1:
                    chainId = _b.sent();
                    return [4 /*yield*/, getTokenByAddressFromList(chainId, address)];
                case 2:
                    token = _b.sent();
                    if (!!token) return [3 /*break*/, 7];
                    return [4 /*yield*/, ERC20Contract(web3, address)];
                case 3:
                    contract = _b.sent();
                    return [4 /*yield*/, contract.methods.symbol().call()];
                case 4:
                    symbol = _b.sent();
                    _a = parseInt;
                    return [4 /*yield*/, contract.methods.decimals().call()];
                case 5:
                    decimals = _a.apply(void 0, [(_b.sent()).toString()]);
                    token = new Token(chainId, address, isNaN(decimals) ? 0 : decimals, symbol);
                    return [4 /*yield*/, cacheToken(chainId, token)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [2 /*return*/, token];
            }
        });
    });
}
/**
 * Retrieves and cache list of tokens for given chain ID.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @returns {Promise<[Map<string, Currency>, Map<string, Currency>]>} Pairs of `symbol <-> Currency`.
 */
function getTokens(supportedChainId) {
    return __awaiter(this, void 0, void 0, function () {
        var list, tokenList, tokenListByAddress, tokens, _a, tokens_1, tokens_1_1, token, _b, chainId, address, decimals, name_1, symbol, isDeprecated, _token;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    list = TOKEN_LISTS[supportedChainId] || [];
                    if (cachedTokens.has(supportedChainId)) {
                        return [2 /*return*/, [cachedTokens.get(supportedChainId), cachedTokensByAddress.get(supportedChainId)]];
                    }
                    tokenList = new Map();
                    tokenListByAddress = new Map();
                    if (supportedChainId !== SupportedChainId.FUSE) {
                        tokenList.set('ETH', Ether.onChain(supportedChainId));
                        tokenListByAddress.set(AddressZero, Ether.onChain(supportedChainId));
                    }
                    else {
                        tokenList.set('FUSE', FUSE);
                        tokenListByAddress.set(AddressZero, FUSE);
                    }
                    _a = flatMap_1;
                    return [4 /*yield*/, Promise.all(__spreadArray([UniswapTokenList.tokens, FuseTokenList.tokens], __read(list.map(fetchURL)), false))];
                case 1:
                    tokens = _a.apply(void 0, [_d.sent()]).filter(Boolean);
                    try {
                        for (tokens_1 = __values(tokens), tokens_1_1 = tokens_1.next(); !tokens_1_1.done; tokens_1_1 = tokens_1.next()) {
                            token = tokens_1_1.value;
                            _b = token, chainId = _b.chainId, address = _b.address, decimals = _b.decimals, name_1 = _b.name, symbol = _b.symbol, isDeprecated = _b.isDeprecated;
                            if (isDeprecated) {
                                continue;
                            }
                            if (tokenList.has(symbol) || supportedChainId !== chainId) {
                                continue;
                            }
                            _token = new Token(chainId, address, decimals, symbol, name_1);
                            tokenList.set(symbol, _token);
                            tokenListByAddress.set(address, _token);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (tokens_1_1 && !tokens_1_1.done && (_c = tokens_1.return)) _c.call(tokens_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    // Add G$ support.
                    if (G$[supportedChainId]) {
                        tokenList.set('G$', G$[supportedChainId]);
                        tokenListByAddress.set(G$[supportedChainId].address, G$[supportedChainId]);
                    }
                    // Add G$X support.
                    if (GDX[supportedChainId]) {
                        tokenList.set('GDX', GDX[supportedChainId]);
                        tokenListByAddress.set(GDX[supportedChainId].address, GDX[supportedChainId]);
                    }
                    // Add GDAO support.
                    if (GDAO[supportedChainId]) {
                        tokenList.set('GDAO', GDAO[supportedChainId]);
                        tokenListByAddress.set(GDAO[supportedChainId].address, GDAO[supportedChainId]);
                    }
                    cachedTokens.set(supportedChainId, tokenList);
                    cachedTokensByAddress.set(supportedChainId, tokenListByAddress);
                    return [2 /*return*/, [tokenList, tokenListByAddress]];
            }
        });
    });
}
/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} symbol Symbol, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
function getToken(supportedChainId, symbol) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getTokens(supportedChainId).then(function (_a) {
                    var _b = __read(_a, 1), map = _b[0];
                    return map.get(symbol);
                })];
        });
    });
}
/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} address Address, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
function getTokenByAddressFromList(supportedChainId, address) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getTokens(supportedChainId).then(function (_a) {
                    var _b = __read(_a, 2), map = _b[1];
                    return map.get(address);
                })];
        });
    });
}

var _format$3="hh-sol-artifact-1";var contractName$3="SimpleStakingV2";var sourceName$3="contracts/staking/SimpleStakingV2.sol";var abi$4=[{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"owner",type:"address"},{indexed:true,internalType:"address",name:"spender",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"recipient",type:"address"},{indexed:false,internalType:"uint256",name:"iTokenGains",type:"uint256"},{indexed:false,internalType:"uint256",name:"tokenGains",type:"uint256"},{indexed:false,internalType:"uint256",name:"actualTokenRedeemed",type:"uint256"},{indexed:false,internalType:"uint256",name:"actualRewardTokenEarned",type:"uint256"},{indexed:false,internalType:"uint256",name:"interestCollectedInDAI",type:"uint256"}],name:"InterestCollected",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"staker",type:"address"},{indexed:false,internalType:"address",name:"token",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"StakeWithdraw",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"staker",type:"address"},{indexed:false,internalType:"address",name:"token",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Staked",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"avatar",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"claimReputation",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"_recipient",type:"address"}],name:"collectUBIInterest",outputs:[{internalType:"uint256",name:"actualTokenRedeemed",type:"uint256"},{internalType:"uint256",name:"actualRewardTokenRedeemed",type:"uint256"},{internalType:"uint256",name:"actualDai",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bool",name:"_returnTokenBalanceInUSD",type:"bool"},{internalType:"bool",name:"_returnTokenGainsInUSD",type:"bool"}],name:"currentGains",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"dao",outputs:[{internalType:"contract Controller",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"subtractedValue",type:"uint256"}],name:"decreaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"getGasCostForInterestTransfer",outputs:[{internalType:"uint32",name:"",type:"uint32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"user",type:"address"}],name:"getProductivity",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"getRouter",outputs:[{internalType:"contract Uniswap",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getStats",outputs:[{internalType:"uint256",name:"_accAmountPerShare",type:"uint256"},{internalType:"uint128",name:"_mintedRewards",type:"uint128"},{internalType:"uint128",name:"_totalProductivity",type:"uint128"},{internalType:"uint128",name:"_totalEffectiveStakes",type:"uint128"},{internalType:"uint128",name:"_accumulatedRewards",type:"uint128"},{internalType:"uint128",name:"_lastRewardBlock",type:"uint128"},{internalType:"uint64",name:"_maxMultiplierThreshold",type:"uint64"},{internalType:"uint8",name:"_tokenDecimalDifference",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_oracle",type:"address"},{internalType:"uint256",name:"_amount",type:"uint256"},{internalType:"uint256",name:"_decimals",type:"uint256"}],name:"getTokenValueInUSD",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_staker",type:"address"}],name:"getUserMintedAndPending",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"user",type:"address"},{internalType:"uint256",name:"rewardsPerBlock",type:"uint256"},{internalType:"uint256",name:"blockStart",type:"uint256"},{internalType:"uint256",name:"blockEnd",type:"uint256"}],name:"getUserPendingReward",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"iToken",outputs:[{internalType:"contract ERC20",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"addedValue",type:"uint256"}],name:"increaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"_token",type:"address"},{internalType:"address",name:"_iToken",type:"address"},{internalType:"contract INameService",name:"_ns",type:"address"},{internalType:"string",name:"_tokenName",type:"string"},{internalType:"string",name:"_tokenSymbol",type:"string"},{internalType:"uint64",name:"_maxRewardThreshold",type:"uint64"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"isPaused",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[],name:"lockedUSDValue",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"maxLiquidityPercentageSwap",outputs:[{internalType:"uint24",name:"",type:"uint24"}],stateMutability:"view",type:"function"},{inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"nameService",outputs:[{internalType:"contract INameService",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"nativeToken",outputs:[{internalType:"contract IGoodDollar",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bool",name:"_isPaused",type:"bool"}],name:"pause",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"recover",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"user",type:"address"},{internalType:"uint256",name:"rewardsPerBlock",type:"uint256"},{internalType:"uint256",name:"blockStart",type:"uint256"},{internalType:"uint256",name:"blockEnd",type:"uint256"}],name:"rewardsMinted",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint24",name:"_maxPercentage",type:"uint24"}],name:"setMaxLiquidityPercentageSwap",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"_amount",type:"uint256"},{internalType:"uint256",name:"_donationPer",type:"uint256"},{internalType:"bool",name:"_inInterestToken",type:"bool"}],name:"stake",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"token",outputs:[{internalType:"contract ERC20",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"recipient",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"sender",type:"address"},{internalType:"address",name:"recipient",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"updateAvatar",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"users",outputs:[{internalType:"uint128",name:"amount",type:"uint128"},{internalType:"uint128",name:"effectiveStakes",type:"uint128"},{internalType:"uint128",name:"rewardDebt",type:"uint128"},{internalType:"uint128",name:"rewardEarn",type:"uint128"},{internalType:"uint128",name:"rewardMinted",type:"uint128"},{internalType:"uint64",name:"lastRewardTime",type:"uint64"},{internalType:"uint64",name:"multiplierResetTime",type:"uint64"}],stateMutability:"view",type:"function"},{inputs:[],name:"withdrawRewards",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"_amount",type:"uint256"},{internalType:"bool",name:"_inInterestToken",type:"bool"}],name:"withdrawStake",outputs:[],stateMutability:"nonpayable",type:"function"}];var bytecode$3="0x";var deployedBytecode$3="0x";var linkReferences$3={};var deployedLinkReferences$3={};var SimpleStakingV2 = {_format:_format$3,contractName:contractName$3,sourceName:sourceName$3,abi:abi$4,bytecode:bytecode$3,deployedBytecode:deployedBytecode$3,linkReferences:linkReferences$3,deployedLinkReferences:deployedLinkReferences$3};

var develop={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920}};var dapptest={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920}};var test={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920,guardian:"0x914dA3B2508634998d244059dAb5488D9bA1814f"}};var fuse={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920}};var staging={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920}};var production={governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"96000000000000000000000000",proposalVotingPeriod:241920,guardian:"0x914dA3B2508634998d244059dAb5488D9bA1814f"}};var contractsAddresses = {"default":{governance:{proposalVotingPeriod:241920},compound:{},aave:{},expansionRatio:{nom:999388834642296,denom:1000000000000000},staking:{rewardsPerBlock:13888,fullRewardsThreshold:172800},GoodCompoundStaking:{CompCollectGasCost:150000,CollectInterestGasCost:250000},GoodAaveStaking:{stkAaveClaimCost:50000,CollectInterestGasCost:250000}},develop:develop,"develop-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:86040},chainlink:{gasPrice:"0xF8161973a556bf5fEbb3BaCe573262FCd3b33973",dai_eth:"0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5",eth_usd:"0x30B5068156688f818cEa0874B580206dFe081a03"}},dapptest:dapptest,"dapptest-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:86040}},test:test,"test-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:86040,guardian:"0x914dA3B2508634998d244059dAb5488D9bA1814f"},chainlink:{gasPrice:"0xF8161973a556bf5fEbb3BaCe573262FCd3b33973",dai_eth:"0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5",eth_usd:"0x30B5068156688f818cEa0874B580206dFe081a03"}},fuse:fuse,"fuse-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:241920},bancor:"0x57b2c85934Ef1A891eC9b9945f3fdbcf1104c302",compound:{dai:"0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",cdai:"0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff",comp:"0xf76d4a441e4ba86a923ce32b89aff89dbccaa075",daiUsdOracle:"0xaF540Ca83c7da3181778e3D1E11A6137e7e0085B",compUsdOracle:"0xE331E3C01c8D85fE107b13ad2888a61a4885199f"},chainlink:{gasPrice:"0xF8161973a556bf5fEbb3BaCe573262FCd3b33973",dai_eth:"0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5",eth_usd:"0x30B5068156688f818cEa0874B580206dFe081a03"},uniswapRouter:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",donationsStaking:{ethToStakingTokenSwapPath:["0x0000000000000000000000000000000000000000","0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd"],stakingTokenToEthSwapPath:["0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd","0x0000000000000000000000000000000000000000"]}},staging:staging,"staging-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:80640},bancor:"0x57b2c85934Ef1A891eC9b9945f3fdbcf1104c302",compound:{dai:"0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",cdai:"0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff",comp:"0xf76d4a441e4ba86a923ce32b89aff89dbccaa075",daiUsdOracle:"0xaF540Ca83c7da3181778e3D1E11A6137e7e0085B",compUsdOracle:"0xE331E3C01c8D85fE107b13ad2888a61a4885199f"},chainlink:{gasPrice:"0xF8161973a556bf5fEbb3BaCe573262FCd3b33973",dai_eth:"0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5",eth_usd:"0x30B5068156688f818cEa0874B580206dFe081a03"},uniswapRouter:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",donationsStaking:{ethToStakingTokenSwapPath:["0x0000000000000000000000000000000000000000","0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd"],stakingTokenToEthSwapPath:["0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd","0x0000000000000000000000000000000000000000"]}},"kovan-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"24000000000000000000000000",proposalVotingPeriod:80640},bancor:"0x8c1255c46B3a04686eA0FfD3B71d7cB391091a58",compound:{cdai:"0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad",dai:"0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",comp:"0x61460874a7196d6a22d1ee4922473664b3e95270",daiUsdOracle:"0x777A68032a88E5A84678A77Af2CD65A7b3c0775a",compUsdOracle:"0xECF93D14d25E02bA2C13698eeDca9aA98348EFb6"},aave:{aave:"0x310d1D1043080668412E91502d7aa6Fbef0C346a",lendingPool:"0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",incentiveController:"0x54502350fb61b7752fFFA36690ecA43c6562fd5C",usdc:"0xe22da380ee6B445bb8273C81944ADEB6E8450422",usdcUsdOracle:"0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60",aaveUsdOracle:"0xDE1af8A8442290e13C0451fb7Fd60bD2725e6Afc"},chainlink:{dai_eth:"0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541",eth_usd:"0xc9ee68cc1815641c4bf8bfdfa1e1636644cdf114",gasPrice:"0x04B8300639D66185F24Ee506aa083da94Ca41c6d"},uniswapRouter:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"},production:production,"production-mainnet":{gdxAirdrop:"0x707f775d730a9b17ee62c21e00188da4dff26602a58c338269cd115f30acbe2f",governance:{gdaoAirdrop:"0x2feece0e9bc03b54e63e6eb7abb81a128f6bc7ce9a3bafd5ca2bea0c40e3634b",gdaoTotalSupply:"96000000000000000000000000",proposalVotingPeriod:80640,guardian:"0xF0652a820dd39EC956659E0018Da022132f2f40a"},bancor:"0xA049894d5dcaD406b7C827D6dc6A0B58CA4AE73a",compound:{cdai:"0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",dai:"0x6B175474E89094C44Da98b954EedeAC495271d0F",comp:"0xc00e94cb662c3520282e6f5717214004a7f26888",daiUsdOracle:"0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",compUsdOracle:"0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5"},aave:{lendingPool:"0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",incentiveController:"0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5",usdc:"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",usdcUsdOracle:"0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",aaveUsdOracle:"0x547a514d5e3769680ce22b2361c10ea13619e8a9"},chainlink:{gasPrice:"0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C",dai_eth:"0x773616E4d11A78F511299002da57A0a94577F1f4",eth_usd:"0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"},uniswapRouter:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"}};

var LIQUIDITY_PROTOCOL;
(function (LIQUIDITY_PROTOCOL) {
    LIQUIDITY_PROTOCOL["COMPOUND"] = "COMPOUND";
    LIQUIDITY_PROTOCOL["AAVE"] = "AAVE";
    LIQUIDITY_PROTOCOL["UNKNOWN"] = "UNKNOWN";
    LIQUIDITY_PROTOCOL["G$"] = "GOODDOLLAR";
    LIQUIDITY_PROTOCOL["GOODDAO"] = "GoodDAO";
})(LIQUIDITY_PROTOCOL || (LIQUIDITY_PROTOCOL = {}));

/**
 * Returns instance of SimpleStaking contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
function simpleStakingContractV2(web3, address) {
    return new web3.eth.Contract(SimpleStakingV2.abi, address);
}
/**
 * Returns all available addresses for simpleStaking
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<simpleStakingAddresses>}
 */
function getSimpleStakingContractAddressesV3(web3) {
    return __awaiter(this, void 0, void 0, function () {
        var chainId, deployments, all, _a, _b, _c, release, deployment, _addresses, addresses, _addresses_1, _addresses_1_1, rawAddress;
        var e_1, _d, e_2, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, getChainId(web3)];
                case 1:
                    chainId = _f.sent();
                    deployments = { v3: 'StakingContractsV3', v2: 'StakingContractsV2', v1: 'StakingContracts' };
                    try {
                        all = [];
                        try {
                            for (_a = __values(Object.entries(deployments)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), release = _c[0], deployment = _c[1];
                                _addresses = G$ContractAddresses(chainId, deployment);
                                addresses = [];
                                try {
                                    for (_addresses_1 = (e_2 = void 0, __values(_addresses)), _addresses_1_1 = _addresses_1.next(); !_addresses_1_1.done; _addresses_1_1 = _addresses_1.next()) {
                                        rawAddress = _addresses_1_1.value;
                                        if (Array.isArray(rawAddress)) {
                                            addresses.push(rawAddress[0]);
                                        }
                                        else {
                                            addresses.push(rawAddress);
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (_addresses_1_1 && !_addresses_1_1.done && (_e = _addresses_1.return)) _e.call(_addresses_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                all = __spreadArray(__spreadArray([], __read(all), false), [{ release: release, addresses: addresses }], false);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2 /*return*/, all];
                    }
                    catch (error) {
                        console.log('getSimpleStakingConractV3 -->', error);
                        return [2 /*return*/, [{ release: '', addresses: [''] }]];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns usd Oracle address.
 * @param {Web3} web3 Web3 instance.
 * @returns {string}
 */
// TODO: Add function description
function getUsdOracle(protocol, web3) {
    var usdOracle, deploymentName;
    var chainId = web3.givenProvider.networkVersion;
    var CURRENT_NETWORK = getNetworkEnv();
    deploymentName = 'production-mainnet';
    if (chainId == SupportedChainId.MAINNET || chainId == SupportedChainId.ROPSTEN) {
        deploymentName = "".concat(CURRENT_NETWORK, "-mainnet");
    }
    else if (chainId == SupportedChainId.KOVAN) {
        deploymentName = 'kovan-mainnet';
    }
    if (protocol === LIQUIDITY_PROTOCOL.COMPOUND) {
        usdOracle = contractsAddresses[deploymentName].compound.daiUsdOracle;
    }
    else {
        usdOracle = contractsAddresses[deploymentName].aave.usdcUsdOracle;
    }
    return usdOracle;
}

var _format$2="hh-sol-artifact-1";var contractName$2="GoodFundManager";var sourceName$2="contracts/staking/GoodFundManager.sol";var abi$3=[{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"previousAdmin",type:"address"},{indexed:false,internalType:"address",name:"newAdmin",type:"address"}],name:"AdminChanged",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"beacon",type:"address"}],name:"BeaconUpgraded",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"newCollectInterestTimeThreshold",type:"uint256"}],name:"CollectInterestTimeThresholdSet",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"caller",type:"address"},{indexed:false,internalType:"address",name:"reserve",type:"address"},{indexed:false,internalType:"address[]",name:"stakings",type:"address[]"},{indexed:false,internalType:"uint256",name:"cDAIinterestEarned",type:"uint256"},{indexed:false,internalType:"uint256",name:"gdUBI",type:"uint256"},{indexed:false,internalType:"uint256",name:"gdReward",type:"uint256"}],name:"FundsTransferred",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"newGasCostExceptInterestCollect",type:"uint256"}],name:"GasCostExceptInterestCollectSet",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"newGasCost",type:"uint256"}],name:"GasCostSet",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint8",name:"newInterestMultiplier",type:"uint8"}],name:"InterestMultiplierSet",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"stakingContract",type:"address"},{indexed:false,internalType:"address",name:"staker",type:"address"},{indexed:false,internalType:"uint256",name:"gdReward",type:"uint256"}],name:"StakingRewardMinted",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint32",name:"_rewardsPerBlock",type:"uint32"},{indexed:false,internalType:"address",name:"_stakingAddress",type:"address"},{indexed:false,internalType:"uint32",name:"_blockStart",type:"uint32"},{indexed:false,internalType:"uint32",name:"_blockEnd",type:"uint32"},{indexed:false,internalType:"bool",name:"_isBlackListed",type:"bool"}],name:"StakingRewardSet",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"implementation",type:"address"}],name:"Upgraded",type:"event"},{inputs:[{internalType:"uint256",name:"",type:"uint256"}],name:"activeContracts",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"avatar",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"calcSortedContracts",outputs:[{components:[{internalType:"address",name:"contractAddress",type:"address"},{internalType:"uint256",name:"interestBalance",type:"uint256"},{internalType:"uint256",name:"collectedInterestSoFar",type:"uint256"},{internalType:"uint256",name:"gasCostSoFar",type:"uint256"},{internalType:"uint256",name:"maxGasAmountSoFar",type:"uint256"},{internalType:"bool",name:"maxGasLargerOrEqualRequired",type:"bool"}],internalType:"struct GoodFundManager.InterestInfo[]",name:"",type:"tuple[]"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address[]",name:"_stakingContracts",type:"address[]"},{internalType:"bool",name:"_forceAndWaiverRewards",type:"bool"}],name:"collectInterest",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"collectInterestTimeThreshold",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"dao",outputs:[{internalType:"contract Controller",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"gasCostExceptInterestCollect",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"gdMintGasCost",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"getActiveContractsCount",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"_gasAmount",type:"uint256"}],name:"getGasPriceInGD",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"_gasAmount",type:"uint256"},{internalType:"bool",name:"_inDAI",type:"bool"}],name:"getGasPriceIncDAIorDAI",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract INameService",name:"_ns",type:"address"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"interestMultiplier",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[],name:"lastCollectedInterest",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"lastCollectedInterestBlock",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"minCollectInterestIntervalDays",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_token",type:"address"},{internalType:"address",name:"_user",type:"address"}],name:"mintReward",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"nameService",outputs:[{internalType:"contract INameService",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"nativeToken",outputs:[{internalType:"contract IGoodDollar",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"rewardsForStakingContract",outputs:[{internalType:"uint32",name:"blockReward",type:"uint32"},{internalType:"uint64",name:"blockStart",type:"uint64"},{internalType:"uint64",name:"blockEnd",type:"uint64"},{internalType:"bool",name:"isBlackListed",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"_timeThreshold",type:"uint256"}],name:"setCollectInterestTimeThreshold",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"_gasAmount",type:"uint256"}],name:"setGasCost",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"_gasAmount",type:"uint256"}],name:"setGasCostExceptInterestCollect",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint8",name:"_newMultiplier",type:"uint8"}],name:"setInterestMultiplier",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint32",name:"_rewardsPerBlock",type:"uint32"},{internalType:"address",name:"_stakingAddress",type:"address"},{internalType:"uint32",name:"_blockStart",type:"uint32"},{internalType:"uint32",name:"_blockEnd",type:"uint32"},{internalType:"bool",name:"_isBlackListed",type:"bool"}],name:"setStakingReward",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"updateAvatar",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"}],name:"upgradeTo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"},{internalType:"bytes",name:"data",type:"bytes"}],name:"upgradeToAndCall",outputs:[],stateMutability:"payable",type:"function"}];var bytecode$2="0x60a06040523060601b60805234801561001757600080fd5b5060805160601c61333f61004b60003960008181610b7001528181610bb901528181610fe10152611021015261333f6000f3fe6080604052600436106101475760003560e01c8063089445141461014c5780630e47dbd91461016e57806312ce63d914610192578063195dc7cc146101a85780631b3c90a8146101d457806324ccc1e7146101e95780633659cfe61461020b5780633e6326fc1461022b5780634162169f1461025857806344fa7622146102785780634f1ef286146102985780635aef7de6146102ab57806372d00e9f146102cb578063791b6bc3146102eb5780637c6b63b41461030b5780638aba46591461032b5780639d89e9a41461034b578063a25dc5f41461036a578063aac7efb414610380578063b6eee2c9146103a0578063b7714ae2146103c0578063c4d66de8146103e0578063c81a2b5d14610400578063d025014414610416578063e1758bd8146104a9578063e31bf132146104be578063f03b2890146104d4578063f4a7a395146104f4575b600080fd5b34801561015857600080fd5b5061016c610167366004612abe565b61050a565b005b34801561017a57600080fd5b5060a0545b6040519081526020015b60405180910390f35b34801561019e57600080fd5b5061017f609a5481565b3480156101b457600080fd5b50609f546101c29060ff1681565b60405160ff9091168152602001610189565b3480156101e057600080fd5b5061016c61055b565b3480156101f557600080fd5b506101fe6106a0565b6040516101899190612ae1565b34801561021757600080fd5b5061016c610226366004612b79565b610b65565b34801561023757600080fd5b5060675461024b906001600160a01b031681565b6040516101899190612b96565b34801561026457600080fd5b5060655461024b906001600160a01b031681565b34801561028457600080fd5b5061017f610293366004612bb8565b610c37565b61016c6102a6366004612bfe565b610fd6565b3480156102b757600080fd5b5060665461024b906001600160a01b031681565b3480156102d757600080fd5b5061024b6102e6366004612cc1565b611090565b3480156102f757600080fd5b5061016c610306366004612cc1565b6110ba565b34801561031757600080fd5b5061016c610326366004612cf3565b6110f7565b34801561033757600080fd5b5061016c610346366004612cc1565b611476565b34801561035757600080fd5b50609f546101c290610100900460ff1681565b34801561037657600080fd5b5061017f609d5481565b34801561038c57600080fd5b5061017f61039b366004612cc1565b6114b3565b3480156103ac57600080fd5b5061016c6103bb366004612d5e565b6115f5565b3480156103cc57600080fd5b5061016c6103db366004612cc1565b61200f565b3480156103ec57600080fd5b5061016c6103fb366004612b79565b61204c565b34801561040c57600080fd5b5061017f609c5481565b34801561042257600080fd5b50610473610431366004612b79565b60a16020526000908152604090205463ffffffff8116906001600160401b03600160201b8204811691600160601b81049091169060ff600160a01b9091041684565b6040805163ffffffff9590951685526001600160401b039384166020860152919092169083015215156060820152608001610189565b3480156104b557600080fd5b5061024b61212c565b3480156104ca57600080fd5b5061017f609b5481565b3480156104e057600080fd5b5061016c6104ef366004612de3565b6121b0565b34801561050057600080fd5b5061017f609e5481565b610512612440565b609f805460ff191660ff83169081179091556040519081527fceef3bba37867319344ac9cc91b1d2318daa822bae8d15118d84aedc1fbba330906020015b60405180910390a150565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156105b957600080fd5b505afa1580156105cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105f19190612e11565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561064657600080fd5b505afa15801561065a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061067e9190612e11565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b60a0546060906000906001600160401b038111156106c0576106c0612be8565b6040519080825280602002602001820160405280156106e9578160200160208202803683370190505b5060a0549091506000906001600160401b0381111561070a5761070a612be8565b604051908082528060200260200182016040528015610733578160200160208202803683370190505b5060a0549091506000906001600160401b0381111561075457610754612be8565b6040519080825280602002602001820160405280156107c957816020015b6107b66040518060c0016040528060006001600160a01b03168152602001600081526020016000815260200160008152602001600081526020016000151581525090565b8152602001906001900390816107725790505b5090506000805b60a05481121561091a5760a081815481106107ed576107ed612e2e565b600091825260208220015460405163026c13ed60e21b81526004810192909252600160248301526001600160a01b0316906309b04fb49060440160a06040518083038186803b15801561083f57600080fd5b505afa158015610853573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108779190612e44565b955050841592506109089150505760a0818154811061089857610898612e2e565b9060005260206000200160009054906101000a90046001600160a01b03168582815181106108c8576108c8612e2e565b60200260200101906001600160a01b031690816001600160a01b031681525050818482815181106108fb576108fb612e2e565b6020026020010181815250505b8061091281612e9a565b9150506107d0565b609c546109278587612514565b6000806000600160a08054905061093e9190612eba565b94505b60008512610b575760006001600160a01b031689868151811061096657610966612e2e565b60200260200101516001600160a01b031614610b405788858151811061098e5761098e612e2e565b60200260200101516001600160a01b031663e660b53f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156109ce57600080fd5b505afa1580156109e2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a069190612ef9565b9250878581518110610a1a57610a1a612e2e565b602002602001015182610a2d9190612f12565b9150610a398385612f12565b9350609e54609a54610a4b9190612f12565b421015610a8b57610a5d600180610c37565b609f54610a6d919060ff16612f2a565b610a7c836402540be400612f2a565b610a869190612f49565b610aaf565b610a96600180610c37565b610aa5836402540be400612f2a565b610aaf9190612f49565b90506040518060c001604052808a8781518110610ace57610ace612e2e565b60200260200101516001600160a01b03168152602001898781518110610af657610af6612e2e565b60200260200101518152602001838152602001858152602001828152602001858310151515815250878681518110610b3057610b30612e2e565b6020026020010181905250610b45565b610b57565b84610b4f81612f6b565b955050610941565b509498975050505050505050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610bb75760405162461bcd60e51b8152600401610bae90612f89565b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610be9612538565b6001600160a01b031614610c0f5760405162461bcd60e51b8152600401610bae90612fc3565b610c1881612554565b60408051600080825260208201909252610c349183919061255c565b50565b60675460405163bf40fac160e01b815260206004820152601060248201526f4741535f50524943455f4f5241434c4560801b604482015260009182916001600160a01b039091169063bf40fac19060640160206040518083038186803b158015610ca057600080fd5b505afa158015610cb4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cd89190612e11565b90506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610d1557600080fd5b505afa158015610d29573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d4d9190612ef9565b60675460405163bf40fac160e01b815260206004820152600e60248201526d4441495f4554485f4f5241434c4560901b60448201529192506000916001600160a01b039091169063bf40fac19060640160206040518083038186803b158015610db557600080fd5b505afa158015610dc9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ded9190612e11565b90506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610e2a57600080fd5b505afa158015610e3e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e629190612ef9565b9050600081610e7985670de0b6b3a7640000612f2a565b610e839190612f49565b90508615610ea157610e958882612f2a565b95505050505050610fd0565b60675460405163bf40fac160e01b815289916001600160a01b03169063bf40fac190610ecf90600401612ffd565b60206040518083038186803b158015610ee757600080fd5b505afa158015610efb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1f9190612e11565b6001600160a01b031663182df0f56040518163ffffffff1660e01b815260040160206040518083038186803b158015610f5757600080fd5b505afa158015610f6b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f8f9190612ef9565b610f9e6402540be40084612f49565b610fb4906b204fce5e3e25026110000000612f2a565b610fbe9190612f49565b610fc89190612f2a565b955050505050505b92915050565b306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016141561101f5760405162461bcd60e51b8152600401610bae90612f89565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316611051612538565b6001600160a01b0316146110775760405162461bcd60e51b8152600401610bae90612fc3565b61108082612554565b61108c8282600161255c565b5050565b60a081815481106110a057600080fd5b6000918252602090912001546001600160a01b0316905081565b6110c2612440565b609c8190556040518181527fcc09a90bef37a706a00b53dd3f515f9326b029e41271b4bb87777773962cbc6090602001610550565b6110ff612440565b808061112b57506001600160a01b038416600090815260a16020526040902054600160a01b900460ff16155b6111715760405162461bcd60e51b815260206004820152601760248201527663616e277420756e646f20626c61636b6c697374696e6760481b6044820152606401610bae565b600060405180608001604052808763ffffffff16815260200160008663ffffffff161161119e57436111a0565b855b63ffffffff166001600160401b0316815260200160008563ffffffff16116111cc5763ffffffff6111ce565b845b63ffffffff90811682528415156020928301526001600160a01b038816600090815260a18352604080822085518154958701519287015160608801511515600160a01b0260ff60a01b196001600160401b03928316600160601b0216600160601b600160a81b031995909216600160201b026001600160601b0319909816929096169190911795909517919091169390931791909117909155909150805b60a05460ff821610156112cf57866001600160a01b031660a08260ff168154811061129957611299612e2e565b6000918252602090912001546001600160a01b031614156112bd57600191506112cf565b806112c78161301b565b91505061126c565b8180156112e7575083806112e7575063ffffffff8816155b156113a15760a080546112fc9060019061303b565b8154811061130c5761130c612e2e565b60009182526020909120015460a080546001600160a01b039092169160ff841690811061133b5761133b612e2e565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060a080548061137a5761137a613052565b600082815260209020810160001990810180546001600160a01b031916905501905561140d565b811580156113bc575083806113ba575063ffffffff8816155b155b1561140d5760a080546001810182556000919091527f78fdc8d422c49ced035a9edf18d00d3c6a8d81df210f3e5e448e045e77b41e880180546001600160a01b0319166001600160a01b0389161790555b6040805163ffffffff8a811682526001600160a01b038a1660208301528881168284015287166060820152851515608082015290517fcfeece178cde5fc0c509d31ec15ec2d996342bec5d9820be8aabbda11a21205b9181900360a00190a15050505050505050565b61147e612440565b609d8190556040518181527f08deabc2cb3286b159d9350bf977350e1f31e39ae44075269082a800e9ee59de90602001610550565b6000806114c1836000610c37565b60675460405163bf40fac160e01b81529192506000916001600160a01b039091169063bf40fac1906114f590600401613068565b60206040518083038186803b15801561150d57600080fd5b505afa158015611521573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115459190612e11565b6001600160a01b0316639d1b464a6040518163ffffffff1660e01b815260040160206040518083038186803b15801561157d57600080fd5b505afa158015611591573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115b59190612ef9565b90506a084595161401484a000000816115d984676765c793fa10079d601b1b612f2a565b6115e39190612f49565b6115ed9190612f49565b949350505050565b60005a60675460405163bf40fac160e01b81529192506000918291829182916001600160a01b03169063bf40fac19061163090600401612ffd565b60206040518083038186803b15801561164857600080fd5b505afa15801561165c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116809190612e11565b60675460405163bf40fac160e01b815260206004820152600360248201526244414960e81b60448201529192506000916001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156116dd57600080fd5b505afa1580156116f1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117159190612e11565b60675460405163bf40fac160e01b81529192506001600160a01b03169063bf40fac19061174490600401613068565b60206040518083038186803b15801561175c57600080fd5b505afa158015611770573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117949190612e11565b92506000816001600160a01b03166370a08231856040518263ffffffff1660e01b81526004016117c49190612b96565b60206040518083038186803b1580156117dc57600080fd5b505afa1580156117f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118149190612ef9565b90506000836001600160a01b03166370a08231866040518263ffffffff1660e01b81526004016118449190612b96565b60206040518083038186803b15801561185c57600080fd5b505afa158015611870573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118949190612ef9565b905060006118a360018c61303b565b90505b60008c8c838181106118ba576118ba612e2e565b90506020020160208101906118cf9190612b79565b6001600160a01b031614611985578b8b828181106118ef576118ef612e2e565b90506020020160208101906119049190612b79565b6001600160a01b03166337455990876040518263ffffffff1660e01b815260040161192f9190612b96565b606060405180830381600087803b15801561194957600080fd5b505af115801561195d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119819190613089565b5050505b8061198f576119a1565b80611999816130b7565b9150506118a6565b50600082846001600160a01b03166370a08231886040518263ffffffff1660e01b81526004016119d19190612b96565b60206040518083038186803b1580156119e957600080fd5b505afa1580156119fd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a219190612ef9565b611a2b919061303b565b604051631de778a560e01b815260048101829052602481018490526001600160a01b03878116604483015291925090871690631de778a5906064016040805180830381600087803b158015611a7f57600080fd5b505af1158015611a93573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ab791906130c6565b60675460405163bf40fac160e01b8152929a509098506000916001600160a01b039091169063bf40fac190611aee906004016130ea565b60206040518083038186803b158015611b0657600080fd5b505afa158015611b1a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3e9190612e11565b90508815611d6e5760675460405163bf40fac160e01b815260206004820152600f60248201526e1094925111d157d0d3d395149050d5608a1b60448201526001600160a01b0383811692634000aea09291169063bf40fac19060640160206040518083038186803b158015611bb257600080fd5b505afa158015611bc6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bea9190612e11565b60675460405163bf40fac160e01b815260206004820152600d60248201526c15509257d49150d25412515395609a1b60448201528d916001600160a01b03169063bf40fac19060640160206040518083038186803b158015611c4b57600080fd5b505afa158015611c5f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c839190612e11565b604051602001611ca6919060609190911b6001600160601b031916815260140190565b6040516020818303038152906040526040518463ffffffff1660e01b8152600401611cd393929190613166565b602060405180830381600087803b158015611ced57600080fd5b505af1158015611d01573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d25919061318d565b611d6e5760405162461bcd60e51b815260206004820152601a6024820152791d589a48189c9a5919d9481d1c985b9cd9995c8819985a5b195960321b6044820152606401610bae565b506000945050508715159150611fb290505760006064609d545a611d92908961303b565b611d9c9190612f12565b611da790606e612f2a565b611db19190612f49565b9050611dbc816114b3565b60675460405163bf40fac160e01b81529193506001600160a01b038086169263f8a9978f929091169063bf40fac190611df790600401612ffd565b60206040518083038186803b158015611e0f57600080fd5b505afa158015611e23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e479190612e11565b33856040518463ffffffff1660e01b8152600401611e67939291906131aa565b600060405180830381600087803b158015611e8157600080fd5b505af1158015611e95573d6000803e3d6000fd5b505050506000611eb05a611ea9908961303b565b6000610c37565b9050609e54609a54611ec29190612f12565b4210611f315780851015611f2c5760405162461bcd60e51b815260206004820152603e60248201526000805160206132ea83398151915260448201527f6265206c6172676572207468616e207370656e742067617320636f73747300006064820152608401610bae565b611faf565b609f54611f4290829060ff16612f2a565b851015611faf5760405162461bcd60e51b815260206004820152604160248201526000805160206132ea83398151915260448201527f626520696e7465726573744d756c7469706c69657220782067617320636f73746064820152607360f81b608482015260a401610bae565b50505b336001600160a01b03167fa152fd34a7e4c4c82eb0c0b0319d3913dc9189d62ae2fe75aef590f0e391a928838a8a878987604051611ff5969594939291906131ce565b60405180910390a2505042609a55505043609b5550505050565b612017612440565b609e8190556040518181527f28b3b60d9fa0f6edab793c2422ff4784f9381ff9d2062481d1254f732452bfbf90602001610550565b600054610100900460ff1680612065575060005460ff16155b6120c85760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610bae565b600054610100900460ff161580156120ea576000805461ffff19166101011790555b6120f3826126a3565b6203d090609d55624f1a00609e55609f8054620cf850609c5561ffff1916610704179055801561108c576000805461ff00191690555050565b60675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac19061215b906004016130ea565b60206040518083038186803b15801561217357600080fd5b505afa158015612187573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121ab9190612e11565b905090565b33600090815260a160209081526040918290208251608081018452905463ffffffff81168252600160201b81046001600160401b03908116938301849052600160601b82041693820193909352600160a01b90920460ff161515606083015261225b5760405162461bcd60e51b815260206004820152601f60248201527f5374616b696e6720636f6e7472616374206e6f742072656769737465726564006044820152606401610bae565b80516020820151604080840151905163574c5c9360e01b81526001600160a01b038616600482015263ffffffff90931660248401526001600160401b039182166044840152166064820152600090339063574c5c9390608401602060405180830381600087803b1580156122ce57600080fd5b505af11580156122e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123069190612ef9565b905060008111801561231a57506060820151155b1561243a5760675460405163bf40fac160e01b81526001600160a01b039091169063bf40fac19061234d90600401613068565b60206040518083038186803b15801561236557600080fd5b505afa158015612379573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061239d9190612e11565b6001600160a01b031663f8a9978f8585846040518463ffffffff1660e01b81526004016123cc939291906131aa565b600060405180830381600087803b1580156123e657600080fd5b505af11580156123fa573d6000803e3d6000fd5b505050507f5c4a97f844ad1dc8cad420327f32da9b4bd075bab26efa2ae5bd66f84d1fce07338483604051612431939291906131aa565b60405180910390a15b50505050565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561248457600080fd5b505afa158015612498573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124bc9190612e11565b6001600160a01b0316146125125760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f646044820152606401610bae565b565b60018251111561108c5761108c8282600060018651612533919061303b565b6126c6565b6000805160206132a3833981519152546001600160a01b031690565b610c34612440565b6000612566612538565b9050612571846128c0565b60008351118061257e5750815b1561258f5761258d8484612953565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff1661269c57805460ff1916600117815560405161260a9086906125db908590602401612b96565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052612953565b50805460ff1916815561261b612538565b6001600160a01b0316826001600160a01b0316146126935760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b6064820152608401610bae565b61269c85612a3e565b5050505050565b606780546001600160a01b0319166001600160a01b038316179055610c3461055b565b8082101561243a5760008460026126dd8486612f12565b6126e79190612f49565b815181106126f7576126f7612e2e565b6020908102919091010151905082825b8287838151811061271a5761271a612e2e565b6020026020010151101561273a57816127328161323f565b925050612707565b8287828151811061274d5761274d612e2e565b6020026020010151111561276d5780612765816130b7565b91505061273a565b80821061277957612882565b86818151811061278b5761278b612e2e565b60200260200101518783815181106127a5576127a5612e2e565b60200260200101518884815181106127bf576127bf612e2e565b602002602001018984815181106127d8576127d8612e2e565b60200260200101828152508281525050508581815181106127fb576127fb612e2e565b602002602001015186838151811061281557612815612e2e565b602002602001015187848151811061282f5761282f612e2e565b6020026020010188848151811061284857612848612e2e565b6001600160a01b039384166020918202929092010152911690528161286c8161323f565b925050808061287a906130b7565b915050612707565b8085101561289657612896878787846126c6565b806128a08161323f565b915050838110156128b7576128b7878783876126c6565b50505050505050565b803b6129245760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401610bae565b6000805160206132a383398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b6129b25760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401610bae565b600080846001600160a01b0316846040516129cd9190613253565b600060405180830381855af49150503d8060008114612a08576040519150601f19603f3d011682016040523d82523d6000602084013e612a0d565b606091505b5091509150612a3582826040518060600160405280602781526020016132c360279139612a7e565b95945050505050565b612a47816128c0565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60608315612a8d575081612ab7565b825115612a9d5782518084602001fd5b8160405162461bcd60e51b8152600401610bae919061326f565b9392505050565b600060208284031215612ad057600080fd5b813560ff81168114612ab757600080fd5b602080825282518282018190526000919060409081850190868401855b82811015612b5757815180516001600160a01b0316855286810151878601528581015186860152606080820151908601526080808201519086015260a09081015115159085015260c09093019290850190600101612afe565b5091979650505050505050565b6001600160a01b0381168114610c3457600080fd5b600060208284031215612b8b57600080fd5b8135612ab781612b64565b6001600160a01b0391909116815260200190565b8015158114610c3457600080fd5b60008060408385031215612bcb57600080fd5b823591506020830135612bdd81612baa565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215612c1157600080fd5b8235612c1c81612b64565b915060208301356001600160401b0380821115612c3857600080fd5b818501915085601f830112612c4c57600080fd5b813581811115612c5e57612c5e612be8565b604051601f8201601f19908116603f01168101908382118183101715612c8657612c86612be8565b81604052828152886020848701011115612c9f57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b600060208284031215612cd357600080fd5b5035919050565b803563ffffffff81168114612cee57600080fd5b919050565b600080600080600060a08688031215612d0b57600080fd5b612d1486612cda565b94506020860135612d2481612b64565b9350612d3260408701612cda565b9250612d4060608701612cda565b91506080860135612d5081612baa565b809150509295509295909350565b600080600060408486031215612d7357600080fd5b83356001600160401b0380821115612d8a57600080fd5b818601915086601f830112612d9e57600080fd5b813581811115612dad57600080fd5b8760208260051b8501011115612dc257600080fd5b60209283019550935050840135612dd881612baa565b809150509250925092565b60008060408385031215612df657600080fd5b8235612e0181612b64565b91506020830135612bdd81612b64565b600060208284031215612e2357600080fd5b8151612ab781612b64565b634e487b7160e01b600052603260045260246000fd5b600080600080600060a08688031215612e5c57600080fd5b5050835160208501516040860151606087015160809097015192989197509594509092509050565b634e487b7160e01b600052601160045260246000fd5b60006001600160ff1b03821415612eb357612eb3612e84565b5060010190565b60008083128015600160ff1b850184121615612ed857612ed8612e84565b6001600160ff1b0384018313811615612ef357612ef3612e84565b50500390565b600060208284031215612f0b57600080fd5b5051919050565b60008219821115612f2557612f25612e84565b500190565b6000816000190483118215151615612f4457612f44612e84565b500290565b600082612f6657634e487b7160e01b600052601260045260246000fd5b500490565b6000600160ff1b821415612f8157612f81612e84565b506000190190565b6020808252602c9082015260008051602061328383398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c9082015260008051602061328383398151915260408201526b6163746976652070726f787960a01b606082015260800190565b6020808252600490820152634344414960e01b604082015260600190565b600060ff821660ff81141561303257613032612e84565b60010192915050565b60008282101561304d5761304d612e84565b500390565b634e487b7160e01b600052603160045260246000fd5b6020808252600790820152665245534552564560c81b604082015260600190565b60008060006060848603121561309e57600080fd5b8351925060208401519150604084015190509250925092565b600081612f8157612f81612e84565b600080604083850312156130d957600080fd5b505080516020909101519092909150565b6020808252600a908201526923a7a7a22227a62620a960b11b604082015260600190565b60005b83811015613129578181015183820152602001613111565b8381111561243a5750506000910152565b6000815180845261315281602086016020860161310e565b601f01601f19169290920160200192915050565b60018060a01b0384168152826020820152606060408201526000612a35606083018461313a565b60006020828403121561319f57600080fd5b8151612ab781612baa565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03878116825260a06020808401829052908301879052600091889160c08501845b8a81101561321d57843561320981612b64565b8416825293820193908201906001016131f6565b5060408601989098525050505060608101929092526080909101529392505050565b6000600019821415612eb357612eb3612e84565b6000825161326581846020870161310e565b9190910192915050565b602081526000612ab7602083018461313a56fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564436f6c6c656374656420696e7465726573742076616c75652073686f756c6420a26469706673582212200a8ce0851e48f33684f37482b9c3b9a87e50be0376bf993c0aa49529f7c4e56e64736f6c63430008080033";var deployedBytecode$2="0x6080604052600436106101475760003560e01c8063089445141461014c5780630e47dbd91461016e57806312ce63d914610192578063195dc7cc146101a85780631b3c90a8146101d457806324ccc1e7146101e95780633659cfe61461020b5780633e6326fc1461022b5780634162169f1461025857806344fa7622146102785780634f1ef286146102985780635aef7de6146102ab57806372d00e9f146102cb578063791b6bc3146102eb5780637c6b63b41461030b5780638aba46591461032b5780639d89e9a41461034b578063a25dc5f41461036a578063aac7efb414610380578063b6eee2c9146103a0578063b7714ae2146103c0578063c4d66de8146103e0578063c81a2b5d14610400578063d025014414610416578063e1758bd8146104a9578063e31bf132146104be578063f03b2890146104d4578063f4a7a395146104f4575b600080fd5b34801561015857600080fd5b5061016c610167366004612abe565b61050a565b005b34801561017a57600080fd5b5060a0545b6040519081526020015b60405180910390f35b34801561019e57600080fd5b5061017f609a5481565b3480156101b457600080fd5b50609f546101c29060ff1681565b60405160ff9091168152602001610189565b3480156101e057600080fd5b5061016c61055b565b3480156101f557600080fd5b506101fe6106a0565b6040516101899190612ae1565b34801561021757600080fd5b5061016c610226366004612b79565b610b65565b34801561023757600080fd5b5060675461024b906001600160a01b031681565b6040516101899190612b96565b34801561026457600080fd5b5060655461024b906001600160a01b031681565b34801561028457600080fd5b5061017f610293366004612bb8565b610c37565b61016c6102a6366004612bfe565b610fd6565b3480156102b757600080fd5b5060665461024b906001600160a01b031681565b3480156102d757600080fd5b5061024b6102e6366004612cc1565b611090565b3480156102f757600080fd5b5061016c610306366004612cc1565b6110ba565b34801561031757600080fd5b5061016c610326366004612cf3565b6110f7565b34801561033757600080fd5b5061016c610346366004612cc1565b611476565b34801561035757600080fd5b50609f546101c290610100900460ff1681565b34801561037657600080fd5b5061017f609d5481565b34801561038c57600080fd5b5061017f61039b366004612cc1565b6114b3565b3480156103ac57600080fd5b5061016c6103bb366004612d5e565b6115f5565b3480156103cc57600080fd5b5061016c6103db366004612cc1565b61200f565b3480156103ec57600080fd5b5061016c6103fb366004612b79565b61204c565b34801561040c57600080fd5b5061017f609c5481565b34801561042257600080fd5b50610473610431366004612b79565b60a16020526000908152604090205463ffffffff8116906001600160401b03600160201b8204811691600160601b81049091169060ff600160a01b9091041684565b6040805163ffffffff9590951685526001600160401b039384166020860152919092169083015215156060820152608001610189565b3480156104b557600080fd5b5061024b61212c565b3480156104ca57600080fd5b5061017f609b5481565b3480156104e057600080fd5b5061016c6104ef366004612de3565b6121b0565b34801561050057600080fd5b5061017f609e5481565b610512612440565b609f805460ff191660ff83169081179091556040519081527fceef3bba37867319344ac9cc91b1d2318daa822bae8d15118d84aedc1fbba330906020015b60405180910390a150565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156105b957600080fd5b505afa1580156105cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105f19190612e11565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561064657600080fd5b505afa15801561065a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061067e9190612e11565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b60a0546060906000906001600160401b038111156106c0576106c0612be8565b6040519080825280602002602001820160405280156106e9578160200160208202803683370190505b5060a0549091506000906001600160401b0381111561070a5761070a612be8565b604051908082528060200260200182016040528015610733578160200160208202803683370190505b5060a0549091506000906001600160401b0381111561075457610754612be8565b6040519080825280602002602001820160405280156107c957816020015b6107b66040518060c0016040528060006001600160a01b03168152602001600081526020016000815260200160008152602001600081526020016000151581525090565b8152602001906001900390816107725790505b5090506000805b60a05481121561091a5760a081815481106107ed576107ed612e2e565b600091825260208220015460405163026c13ed60e21b81526004810192909252600160248301526001600160a01b0316906309b04fb49060440160a06040518083038186803b15801561083f57600080fd5b505afa158015610853573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108779190612e44565b955050841592506109089150505760a0818154811061089857610898612e2e565b9060005260206000200160009054906101000a90046001600160a01b03168582815181106108c8576108c8612e2e565b60200260200101906001600160a01b031690816001600160a01b031681525050818482815181106108fb576108fb612e2e565b6020026020010181815250505b8061091281612e9a565b9150506107d0565b609c546109278587612514565b6000806000600160a08054905061093e9190612eba565b94505b60008512610b575760006001600160a01b031689868151811061096657610966612e2e565b60200260200101516001600160a01b031614610b405788858151811061098e5761098e612e2e565b60200260200101516001600160a01b031663e660b53f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156109ce57600080fd5b505afa1580156109e2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a069190612ef9565b9250878581518110610a1a57610a1a612e2e565b602002602001015182610a2d9190612f12565b9150610a398385612f12565b9350609e54609a54610a4b9190612f12565b421015610a8b57610a5d600180610c37565b609f54610a6d919060ff16612f2a565b610a7c836402540be400612f2a565b610a869190612f49565b610aaf565b610a96600180610c37565b610aa5836402540be400612f2a565b610aaf9190612f49565b90506040518060c001604052808a8781518110610ace57610ace612e2e565b60200260200101516001600160a01b03168152602001898781518110610af657610af6612e2e565b60200260200101518152602001838152602001858152602001828152602001858310151515815250878681518110610b3057610b30612e2e565b6020026020010181905250610b45565b610b57565b84610b4f81612f6b565b955050610941565b509498975050505050505050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610bb75760405162461bcd60e51b8152600401610bae90612f89565b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610be9612538565b6001600160a01b031614610c0f5760405162461bcd60e51b8152600401610bae90612fc3565b610c1881612554565b60408051600080825260208201909252610c349183919061255c565b50565b60675460405163bf40fac160e01b815260206004820152601060248201526f4741535f50524943455f4f5241434c4560801b604482015260009182916001600160a01b039091169063bf40fac19060640160206040518083038186803b158015610ca057600080fd5b505afa158015610cb4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cd89190612e11565b90506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610d1557600080fd5b505afa158015610d29573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d4d9190612ef9565b60675460405163bf40fac160e01b815260206004820152600e60248201526d4441495f4554485f4f5241434c4560901b60448201529192506000916001600160a01b039091169063bf40fac19060640160206040518083038186803b158015610db557600080fd5b505afa158015610dc9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ded9190612e11565b90506000816001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610e2a57600080fd5b505afa158015610e3e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e629190612ef9565b9050600081610e7985670de0b6b3a7640000612f2a565b610e839190612f49565b90508615610ea157610e958882612f2a565b95505050505050610fd0565b60675460405163bf40fac160e01b815289916001600160a01b03169063bf40fac190610ecf90600401612ffd565b60206040518083038186803b158015610ee757600080fd5b505afa158015610efb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1f9190612e11565b6001600160a01b031663182df0f56040518163ffffffff1660e01b815260040160206040518083038186803b158015610f5757600080fd5b505afa158015610f6b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f8f9190612ef9565b610f9e6402540be40084612f49565b610fb4906b204fce5e3e25026110000000612f2a565b610fbe9190612f49565b610fc89190612f2a565b955050505050505b92915050565b306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016141561101f5760405162461bcd60e51b8152600401610bae90612f89565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316611051612538565b6001600160a01b0316146110775760405162461bcd60e51b8152600401610bae90612fc3565b61108082612554565b61108c8282600161255c565b5050565b60a081815481106110a057600080fd5b6000918252602090912001546001600160a01b0316905081565b6110c2612440565b609c8190556040518181527fcc09a90bef37a706a00b53dd3f515f9326b029e41271b4bb87777773962cbc6090602001610550565b6110ff612440565b808061112b57506001600160a01b038416600090815260a16020526040902054600160a01b900460ff16155b6111715760405162461bcd60e51b815260206004820152601760248201527663616e277420756e646f20626c61636b6c697374696e6760481b6044820152606401610bae565b600060405180608001604052808763ffffffff16815260200160008663ffffffff161161119e57436111a0565b855b63ffffffff166001600160401b0316815260200160008563ffffffff16116111cc5763ffffffff6111ce565b845b63ffffffff90811682528415156020928301526001600160a01b038816600090815260a18352604080822085518154958701519287015160608801511515600160a01b0260ff60a01b196001600160401b03928316600160601b0216600160601b600160a81b031995909216600160201b026001600160601b0319909816929096169190911795909517919091169390931791909117909155909150805b60a05460ff821610156112cf57866001600160a01b031660a08260ff168154811061129957611299612e2e565b6000918252602090912001546001600160a01b031614156112bd57600191506112cf565b806112c78161301b565b91505061126c565b8180156112e7575083806112e7575063ffffffff8816155b156113a15760a080546112fc9060019061303b565b8154811061130c5761130c612e2e565b60009182526020909120015460a080546001600160a01b039092169160ff841690811061133b5761133b612e2e565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060a080548061137a5761137a613052565b600082815260209020810160001990810180546001600160a01b031916905501905561140d565b811580156113bc575083806113ba575063ffffffff8816155b155b1561140d5760a080546001810182556000919091527f78fdc8d422c49ced035a9edf18d00d3c6a8d81df210f3e5e448e045e77b41e880180546001600160a01b0319166001600160a01b0389161790555b6040805163ffffffff8a811682526001600160a01b038a1660208301528881168284015287166060820152851515608082015290517fcfeece178cde5fc0c509d31ec15ec2d996342bec5d9820be8aabbda11a21205b9181900360a00190a15050505050505050565b61147e612440565b609d8190556040518181527f08deabc2cb3286b159d9350bf977350e1f31e39ae44075269082a800e9ee59de90602001610550565b6000806114c1836000610c37565b60675460405163bf40fac160e01b81529192506000916001600160a01b039091169063bf40fac1906114f590600401613068565b60206040518083038186803b15801561150d57600080fd5b505afa158015611521573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115459190612e11565b6001600160a01b0316639d1b464a6040518163ffffffff1660e01b815260040160206040518083038186803b15801561157d57600080fd5b505afa158015611591573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115b59190612ef9565b90506a084595161401484a000000816115d984676765c793fa10079d601b1b612f2a565b6115e39190612f49565b6115ed9190612f49565b949350505050565b60005a60675460405163bf40fac160e01b81529192506000918291829182916001600160a01b03169063bf40fac19061163090600401612ffd565b60206040518083038186803b15801561164857600080fd5b505afa15801561165c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116809190612e11565b60675460405163bf40fac160e01b815260206004820152600360248201526244414960e81b60448201529192506000916001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156116dd57600080fd5b505afa1580156116f1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117159190612e11565b60675460405163bf40fac160e01b81529192506001600160a01b03169063bf40fac19061174490600401613068565b60206040518083038186803b15801561175c57600080fd5b505afa158015611770573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117949190612e11565b92506000816001600160a01b03166370a08231856040518263ffffffff1660e01b81526004016117c49190612b96565b60206040518083038186803b1580156117dc57600080fd5b505afa1580156117f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118149190612ef9565b90506000836001600160a01b03166370a08231866040518263ffffffff1660e01b81526004016118449190612b96565b60206040518083038186803b15801561185c57600080fd5b505afa158015611870573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118949190612ef9565b905060006118a360018c61303b565b90505b60008c8c838181106118ba576118ba612e2e565b90506020020160208101906118cf9190612b79565b6001600160a01b031614611985578b8b828181106118ef576118ef612e2e565b90506020020160208101906119049190612b79565b6001600160a01b03166337455990876040518263ffffffff1660e01b815260040161192f9190612b96565b606060405180830381600087803b15801561194957600080fd5b505af115801561195d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119819190613089565b5050505b8061198f576119a1565b80611999816130b7565b9150506118a6565b50600082846001600160a01b03166370a08231886040518263ffffffff1660e01b81526004016119d19190612b96565b60206040518083038186803b1580156119e957600080fd5b505afa1580156119fd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a219190612ef9565b611a2b919061303b565b604051631de778a560e01b815260048101829052602481018490526001600160a01b03878116604483015291925090871690631de778a5906064016040805180830381600087803b158015611a7f57600080fd5b505af1158015611a93573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ab791906130c6565b60675460405163bf40fac160e01b8152929a509098506000916001600160a01b039091169063bf40fac190611aee906004016130ea565b60206040518083038186803b158015611b0657600080fd5b505afa158015611b1a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3e9190612e11565b90508815611d6e5760675460405163bf40fac160e01b815260206004820152600f60248201526e1094925111d157d0d3d395149050d5608a1b60448201526001600160a01b0383811692634000aea09291169063bf40fac19060640160206040518083038186803b158015611bb257600080fd5b505afa158015611bc6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611bea9190612e11565b60675460405163bf40fac160e01b815260206004820152600d60248201526c15509257d49150d25412515395609a1b60448201528d916001600160a01b03169063bf40fac19060640160206040518083038186803b158015611c4b57600080fd5b505afa158015611c5f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c839190612e11565b604051602001611ca6919060609190911b6001600160601b031916815260140190565b6040516020818303038152906040526040518463ffffffff1660e01b8152600401611cd393929190613166565b602060405180830381600087803b158015611ced57600080fd5b505af1158015611d01573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d25919061318d565b611d6e5760405162461bcd60e51b815260206004820152601a6024820152791d589a48189c9a5919d9481d1c985b9cd9995c8819985a5b195960321b6044820152606401610bae565b506000945050508715159150611fb290505760006064609d545a611d92908961303b565b611d9c9190612f12565b611da790606e612f2a565b611db19190612f49565b9050611dbc816114b3565b60675460405163bf40fac160e01b81529193506001600160a01b038086169263f8a9978f929091169063bf40fac190611df790600401612ffd565b60206040518083038186803b158015611e0f57600080fd5b505afa158015611e23573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e479190612e11565b33856040518463ffffffff1660e01b8152600401611e67939291906131aa565b600060405180830381600087803b158015611e8157600080fd5b505af1158015611e95573d6000803e3d6000fd5b505050506000611eb05a611ea9908961303b565b6000610c37565b9050609e54609a54611ec29190612f12565b4210611f315780851015611f2c5760405162461bcd60e51b815260206004820152603e60248201526000805160206132ea83398151915260448201527f6265206c6172676572207468616e207370656e742067617320636f73747300006064820152608401610bae565b611faf565b609f54611f4290829060ff16612f2a565b851015611faf5760405162461bcd60e51b815260206004820152604160248201526000805160206132ea83398151915260448201527f626520696e7465726573744d756c7469706c69657220782067617320636f73746064820152607360f81b608482015260a401610bae565b50505b336001600160a01b03167fa152fd34a7e4c4c82eb0c0b0319d3913dc9189d62ae2fe75aef590f0e391a928838a8a878987604051611ff5969594939291906131ce565b60405180910390a2505042609a55505043609b5550505050565b612017612440565b609e8190556040518181527f28b3b60d9fa0f6edab793c2422ff4784f9381ff9d2062481d1254f732452bfbf90602001610550565b600054610100900460ff1680612065575060005460ff16155b6120c85760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610bae565b600054610100900460ff161580156120ea576000805461ffff19166101011790555b6120f3826126a3565b6203d090609d55624f1a00609e55609f8054620cf850609c5561ffff1916610704179055801561108c576000805461ff00191690555050565b60675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac19061215b906004016130ea565b60206040518083038186803b15801561217357600080fd5b505afa158015612187573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906121ab9190612e11565b905090565b33600090815260a160209081526040918290208251608081018452905463ffffffff81168252600160201b81046001600160401b03908116938301849052600160601b82041693820193909352600160a01b90920460ff161515606083015261225b5760405162461bcd60e51b815260206004820152601f60248201527f5374616b696e6720636f6e7472616374206e6f742072656769737465726564006044820152606401610bae565b80516020820151604080840151905163574c5c9360e01b81526001600160a01b038616600482015263ffffffff90931660248401526001600160401b039182166044840152166064820152600090339063574c5c9390608401602060405180830381600087803b1580156122ce57600080fd5b505af11580156122e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123069190612ef9565b905060008111801561231a57506060820151155b1561243a5760675460405163bf40fac160e01b81526001600160a01b039091169063bf40fac19061234d90600401613068565b60206040518083038186803b15801561236557600080fd5b505afa158015612379573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061239d9190612e11565b6001600160a01b031663f8a9978f8585846040518463ffffffff1660e01b81526004016123cc939291906131aa565b600060405180830381600087803b1580156123e657600080fd5b505af11580156123fa573d6000803e3d6000fd5b505050507f5c4a97f844ad1dc8cad420327f32da9b4bd075bab26efa2ae5bd66f84d1fce07338483604051612431939291906131aa565b60405180910390a15b50505050565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561248457600080fd5b505afa158015612498573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124bc9190612e11565b6001600160a01b0316146125125760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f646044820152606401610bae565b565b60018251111561108c5761108c8282600060018651612533919061303b565b6126c6565b6000805160206132a3833981519152546001600160a01b031690565b610c34612440565b6000612566612538565b9050612571846128c0565b60008351118061257e5750815b1561258f5761258d8484612953565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff1661269c57805460ff1916600117815560405161260a9086906125db908590602401612b96565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052612953565b50805460ff1916815561261b612538565b6001600160a01b0316826001600160a01b0316146126935760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b6064820152608401610bae565b61269c85612a3e565b5050505050565b606780546001600160a01b0319166001600160a01b038316179055610c3461055b565b8082101561243a5760008460026126dd8486612f12565b6126e79190612f49565b815181106126f7576126f7612e2e565b6020908102919091010151905082825b8287838151811061271a5761271a612e2e565b6020026020010151101561273a57816127328161323f565b925050612707565b8287828151811061274d5761274d612e2e565b6020026020010151111561276d5780612765816130b7565b91505061273a565b80821061277957612882565b86818151811061278b5761278b612e2e565b60200260200101518783815181106127a5576127a5612e2e565b60200260200101518884815181106127bf576127bf612e2e565b602002602001018984815181106127d8576127d8612e2e565b60200260200101828152508281525050508581815181106127fb576127fb612e2e565b602002602001015186838151811061281557612815612e2e565b602002602001015187848151811061282f5761282f612e2e565b6020026020010188848151811061284857612848612e2e565b6001600160a01b039384166020918202929092010152911690528161286c8161323f565b925050808061287a906130b7565b915050612707565b8085101561289657612896878787846126c6565b806128a08161323f565b915050838110156128b7576128b7878783876126c6565b50505050505050565b803b6129245760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401610bae565b6000805160206132a383398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b6129b25760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401610bae565b600080846001600160a01b0316846040516129cd9190613253565b600060405180830381855af49150503d8060008114612a08576040519150601f19603f3d011682016040523d82523d6000602084013e612a0d565b606091505b5091509150612a3582826040518060600160405280602781526020016132c360279139612a7e565b95945050505050565b612a47816128c0565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60608315612a8d575081612ab7565b825115612a9d5782518084602001fd5b8160405162461bcd60e51b8152600401610bae919061326f565b9392505050565b600060208284031215612ad057600080fd5b813560ff81168114612ab757600080fd5b602080825282518282018190526000919060409081850190868401855b82811015612b5757815180516001600160a01b0316855286810151878601528581015186860152606080820151908601526080808201519086015260a09081015115159085015260c09093019290850190600101612afe565b5091979650505050505050565b6001600160a01b0381168114610c3457600080fd5b600060208284031215612b8b57600080fd5b8135612ab781612b64565b6001600160a01b0391909116815260200190565b8015158114610c3457600080fd5b60008060408385031215612bcb57600080fd5b823591506020830135612bdd81612baa565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215612c1157600080fd5b8235612c1c81612b64565b915060208301356001600160401b0380821115612c3857600080fd5b818501915085601f830112612c4c57600080fd5b813581811115612c5e57612c5e612be8565b604051601f8201601f19908116603f01168101908382118183101715612c8657612c86612be8565b81604052828152886020848701011115612c9f57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b600060208284031215612cd357600080fd5b5035919050565b803563ffffffff81168114612cee57600080fd5b919050565b600080600080600060a08688031215612d0b57600080fd5b612d1486612cda565b94506020860135612d2481612b64565b9350612d3260408701612cda565b9250612d4060608701612cda565b91506080860135612d5081612baa565b809150509295509295909350565b600080600060408486031215612d7357600080fd5b83356001600160401b0380821115612d8a57600080fd5b818601915086601f830112612d9e57600080fd5b813581811115612dad57600080fd5b8760208260051b8501011115612dc257600080fd5b60209283019550935050840135612dd881612baa565b809150509250925092565b60008060408385031215612df657600080fd5b8235612e0181612b64565b91506020830135612bdd81612b64565b600060208284031215612e2357600080fd5b8151612ab781612b64565b634e487b7160e01b600052603260045260246000fd5b600080600080600060a08688031215612e5c57600080fd5b5050835160208501516040860151606087015160809097015192989197509594509092509050565b634e487b7160e01b600052601160045260246000fd5b60006001600160ff1b03821415612eb357612eb3612e84565b5060010190565b60008083128015600160ff1b850184121615612ed857612ed8612e84565b6001600160ff1b0384018313811615612ef357612ef3612e84565b50500390565b600060208284031215612f0b57600080fd5b5051919050565b60008219821115612f2557612f25612e84565b500190565b6000816000190483118215151615612f4457612f44612e84565b500290565b600082612f6657634e487b7160e01b600052601260045260246000fd5b500490565b6000600160ff1b821415612f8157612f81612e84565b506000190190565b6020808252602c9082015260008051602061328383398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c9082015260008051602061328383398151915260408201526b6163746976652070726f787960a01b606082015260800190565b6020808252600490820152634344414960e01b604082015260600190565b600060ff821660ff81141561303257613032612e84565b60010192915050565b60008282101561304d5761304d612e84565b500390565b634e487b7160e01b600052603160045260246000fd5b6020808252600790820152665245534552564560c81b604082015260600190565b60008060006060848603121561309e57600080fd5b8351925060208401519150604084015190509250925092565b600081612f8157612f81612e84565b600080604083850312156130d957600080fd5b505080516020909101519092909150565b6020808252600a908201526923a7a7a22227a62620a960b11b604082015260600190565b60005b83811015613129578181015183820152602001613111565b8381111561243a5750506000910152565b6000815180845261315281602086016020860161310e565b601f01601f19169290920160200192915050565b60018060a01b0384168152826020820152606060408201526000612a35606083018461313a565b60006020828403121561319f57600080fd5b8151612ab781612baa565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03878116825260a06020808401829052908301879052600091889160c08501845b8a81101561321d57843561320981612b64565b8416825293820193908201906001016131f6565b5060408601989098525050505060608101929092526080909101529392505050565b6000600019821415612eb357612eb3612e84565b6000825161326581846020870161310e565b9190910192915050565b602081526000612ab7602083018461313a56fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564436f6c6c656374656420696e7465726573742076616c75652073686f756c6420a26469706673582212200a8ce0851e48f33684f37482b9c3b9a87e50be0376bf993c0aa49529f7c4e56e64736f6c63430008080033";var linkReferences$2={};var deployedLinkReferences$2={};var GoodFundManager = {_format:_format$2,contractName:contractName$2,sourceName:sourceName$2,abi:abi$3,bytecode:bytecode$2,deployedBytecode:deployedBytecode$2,linkReferences:linkReferences$2,deployedLinkReferences:deployedLinkReferences$2};

/**
 * Returns instance of GoodFundManager contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
function goodFundManagerContract(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(address !== null && address !== void 0)) return [3 /*break*/, 1];
                    _a = address;
                    return [3 /*break*/, 3];
                case 1:
                    _b = G$ContractAddresses;
                    return [4 /*yield*/, getChainId(web3)];
                case 2:
                    _a = _b.apply(void 0, [_c.sent(), 'GoodFundManager']);
                    _c.label = 3;
                case 3:
                    address = _a;
                    return [2 /*return*/, new web3.eth.Contract(GoodFundManager.abi, address)];
            }
        });
    });
}

var _format$1="hh-sol-artifact-1";var contractName$1="GoodMarketMaker";var sourceName$1="contracts/reserve/GoodMarketMaker.sol";var abi$2=[{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"previousAdmin",type:"address"},{indexed:false,internalType:"address",name:"newAdmin",type:"address"}],name:"AdminChanged",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"caller",type:"address"},{indexed:true,internalType:"address",name:"reserveToken",type:"address"},{indexed:false,internalType:"uint256",name:"amount",type:"uint256"},{indexed:false,internalType:"uint256",name:"returnAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"totalSupply",type:"uint256"},{indexed:false,internalType:"uint256",name:"reserveBalance",type:"uint256"}],name:"BalancesUpdated",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"beacon",type:"address"}],name:"BeaconUpgraded",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"caller",type:"address"},{indexed:false,internalType:"uint256",name:"nom",type:"uint256"},{indexed:false,internalType:"uint256",name:"denom",type:"uint256"}],name:"ReserveRatioUpdated",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"implementation",type:"address"}],name:"Upgraded",type:"event"},{inputs:[],name:"avatar",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_tokenAmount",type:"uint256"}],name:"buy",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_tokenAmount",type:"uint256"}],name:"buyReturn",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"calculateMintExpansion",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_addTokenSupply",type:"uint256"}],name:"calculateMintInterest",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"calculateNewReserveRatio",outputs:[{internalType:"uint32",name:"",type:"uint32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"currentPrice",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"dao",outputs:[{internalType:"contract Controller",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"expandReserveRatio",outputs:[{internalType:"uint32",name:"",type:"uint32"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"getBancor",outputs:[{internalType:"contract BancorFormula",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract INameService",name:"_ns",type:"address"},{internalType:"uint256",name:"_nom",type:"uint256"},{internalType:"uint256",name:"_denom",type:"uint256"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_gdSupply",type:"uint256"},{internalType:"uint256",name:"_tokenSupply",type:"uint256"},{internalType:"uint32",name:"_reserveRatio",type:"uint32"},{internalType:"uint256",name:"_lastExpansion",type:"uint256"}],name:"initializeToken",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"}],name:"mintExpansion",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_gdAmount",type:"uint256"}],name:"mintFromReserveRatio",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_addTokenSupply",type:"uint256"}],name:"mintInterest",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"nameService",outputs:[{internalType:"contract INameService",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"nativeToken",outputs:[{internalType:"contract IGoodDollar",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"reserveRatioDailyExpansion",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"reserveTokens",outputs:[{internalType:"uint256",name:"reserveSupply",type:"uint256"},{internalType:"uint32",name:"reserveRatio",type:"uint32"},{internalType:"uint256",name:"gdSupply",type:"uint256"},{internalType:"uint256",name:"lastExpansion",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_gdAmount",type:"uint256"}],name:"sellReturn",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract ERC20",name:"_token",type:"address"},{internalType:"uint256",name:"_gdAmount",type:"uint256"},{internalType:"uint256",name:"_contributionGdAmount",type:"uint256"}],name:"sellWithContribution",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"_nom",type:"uint256"},{internalType:"uint256",name:"_denom",type:"uint256"}],name:"setReserveRatioDailyExpansion",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"updateAvatar",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"}],name:"upgradeTo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"},{internalType:"bytes",name:"data",type:"bytes"}],name:"upgradeToAndCall",outputs:[],stateMutability:"payable",type:"function"}];var bytecode$1="0x60a06040523060601b60805234801561001757600080fd5b5060805160601c61219461004b6000396000818161077c015281816107bc01528181610b900152610bd001526121946000f3fe6080604052600436106101265760003560e01c80630b1848661461012b5780631b3c90a81461015e5780633659cfe614610175578063371d52dc146101955780633e21374e146101ca5780633e6326fc146101ea5780634162169f1461021757806346f7cb23146102375780634f1ef286146102575780635aef7de61461026a5780635cf3a7a91461028a5780636a989e6e146102aa5780636cb4b4c1146102ca57806374920d30146102e05780637a1ac61e14610300578063835bbd55146103205780638c4959621461038e5780638ee090fb146103a35780639f2d0d07146103c3578063bc179d45146103e3578063cce7ec1314610403578063d5dc7eda14610423578063e1758bd814610443578063e72a083314610458578063e9833c2f14610478575b600080fd5b34801561013757600080fd5b5061014b610146366004611bbe565b610498565b6040519081526020015b60405180910390f35b34801561016a57600080fd5b5061017361062c565b005b34801561018157600080fd5b50610173610190366004611bf3565b610771565b3480156101a157600080fd5b506101b56101b0366004611bf3565b61083a565b60405163ffffffff9091168152602001610155565b3480156101d657600080fd5b5061014b6101e5366004611bf3565b61092a565b3480156101f657600080fd5b5060675461020a906001600160a01b031681565b6040516101559190611c10565b34801561022357600080fd5b5060655461020a906001600160a01b031681565b34801561024357600080fd5b506101b5610252366004611bf3565b610ae1565b610173610265366004611c3a565b610b85565b34801561027657600080fd5b5060665461020a906001600160a01b031681565b34801561029657600080fd5b5061014b6102a5366004611cfd565b610c3f565b3480156102b657600080fd5b5061014b6102c5366004611cfd565b610d2b565b3480156102d657600080fd5b5061014b609b5481565b3480156102ec57600080fd5b5061014b6102fb366004611cfd565b610dbd565b34801561030c57600080fd5b5061017361031b366004611bbe565b610e41565b34801561032c57600080fd5b5061036961033b366004611bf3565b609a602052600090815260409020805460018201546002830154600390930154919263ffffffff9091169184565b6040805194855263ffffffff9093166020850152918301526060820152608001610155565b34801561039a57600080fd5b5061020a610f28565b3480156103af57600080fd5b506101736103be366004611d29565b610fc9565b3480156103cf57600080fd5b506101736103de366004611d84565b611065565b3480156103ef57600080fd5b5061014b6103fe366004611cfd565b611175565b34801561040f57600080fd5b5061014b61041e366004611cfd565b6111c6565b34801561042f57600080fd5b5061017361043e366004611cfd565b611278565b34801561044f57600080fd5b5061020a6113b4565b34801561046457600080fd5b5061014b610473366004611bf3565b611400565b34801561048457600080fd5b5061014b610493366004611bf3565b611464565b60006104a2611555565b6104ab846116f2565b818310156105185760405162461bcd60e51b815260206004820152602f60248201527f474420616d6f756e74206973206c6f776572207468616e2074686520636f6e7460448201526e1c9a589d5d1a5bdb88185b5bdd5b9d608a1b60648201526084015b60405180910390fd5b6001600160a01b0384166000908152609a6020526040902060028101548411156105965760405162461bcd60e51b815260206004820152602960248201527f474420616d6f756e7420697320686967686572207468616e2074686520746f74604482015268616c20737570706c7960b81b606482015260840161050f565b60006105a28486611dbc565b905060006105b08783610d2b565b9050858360020160008282546105c69190611dbc565b90915550508254819084906000906105df908490611dbc565b9091555050600283015483546040516001600160a01b038a1692339260008051602061213f83398151915292610618928b928892611dd3565b60405180910390a3925050505b9392505050565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b15801561068a57600080fd5b505afa15801561069e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106c29190611dee565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561071757600080fd5b505afa15801561072b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074f9190611dee565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156107ba5760405162461bcd60e51b815260040161050f90611e0b565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166107ec61175b565b6001600160a01b0316146108125760405162461bcd60e51b815260040161050f90611e45565b61081b81611777565b604080516000808252602082019092526108379183919061177f565b50565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810184905260028201549281019290925260030154606082015290806108935750620f42405b6108a6683635c9adc5dea0000082611e7f565b90506000620151808360600151426108be9190611dbc565b6108c89190611eb4565b905060005b8181101561090d57676765c793fa10079d601b1b609b54846108ef9190611e7f565b6108f99190611eb4565b92508061090581611ec8565b9150506108cd565b50610921683635c9adc5dea0000083611eb4565b95945050505050565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152816109828461083a565b90506000846001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156109bf57600080fd5b505afa1580156109d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f79190611ee3565b610a059060ff16601b611dbc565b90506000676765c793fa10079d601b1b610a2083600a611fea565b610a2988611464565b610a4263ffffffff8716683635c9adc5dea00000611e7f565b610a4c9190611e7f565b610a569190611e7f565b610a609190611eb4565b90506000609c54601b610a739190611dbc565b90506000610a8282600a611fea565b83610a8e86600a611fea565b8851610a9a9190611e7f565b610aaf90676765c793fa10079d601b1b611e7f565b610ab99190611eb4565b610ac39190611eb4565b9050856040015181610ad59190611dbc565b98975050505050505050565b6000610aeb611555565b610af4826116f2565b6001600160a01b0382166000908152609a60205260409020600181015463ffffffff1680610b225750620f42405b610b2b8461083a565b60018301805463ffffffff191663ffffffff9290921691909117905560038201546201518090610b5b9042611dbc565b610b659190611ff6565b610b6f9042611dbc565b6003830155506001015463ffffffff1692915050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610bce5760405162461bcd60e51b815260040161050f90611e0b565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610c0061175b565b6001600160a01b031614610c265760405162461bcd60e51b815260040161050f90611e45565b610c2f82611777565b610c3b8282600161177f565b5050565b6001600160a01b0382166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152610c95610f28565b604080830151835160208501519251630a68039f60e21b81526001600160a01b0394909416936329a00e7c93610cd1939291899060040161200a565b60206040518083038186803b158015610ce957600080fd5b505afa158015610cfd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d21919061202b565b9150505b92915050565b6001600160a01b0382166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152610d81610f28565b6040808301518351602085015192516349f9b0f760e01b81526001600160a01b0394909416936349f9b0f793610cd1939291899060040161200a565b6000610dc7611555565b610dd0836116f2565b81610ddd57506000610d25565b6000610de98484611175565b6001600160a01b0385166000908152609a602052604081206002810180549394509092849290610e1a908490612044565b9091555050805484908290600090610e33908490612044565b909155509195945050505050565b600054610100900460ff1680610e5a575060005460ff16155b610ebd5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b606482015260840161050f565b600054610100900460ff16158015610edf576000805461ffff19166101011790555b81610ef584676765c793fa10079d601b1b611e7f565b610eff9190611eb4565b609b556002609c55610f10846118c6565b8015610f22576000805461ff00191690555b50505050565b60675460405163bf40fac160e01b815260206004820152600e60248201526d42414e434f525f464f524d554c4160901b60448201526000916001600160a01b03169063bf40fac1906064015b60206040518083038186803b158015610f8c57600080fd5b505afa158015610fa0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fc49190611dee565b905090565b610fd1611555565b60405180608001604052808481526020018363ffffffff168152602001858152602001826000146110025782611004565b425b90526001600160a01b03959095166000908152609a6020908152604091829020875181559087015160018201805463ffffffff191663ffffffff90921691909117905590860151600282015560609095015160039095019490945550505050565b61106d611555565b600081116110bb5760405162461bcd60e51b815260206004820152601b60248201527a064656e6f6d696e61746f72206d7573742062652061626f7665203602c1b604482015260640161050f565b806110d183676765c793fa10079d601b1b611e7f565b6110db9190611eb4565b609b819055676765c793fa10079d601b1b116111365760405162461bcd60e51b815260206004820152601a602482015279496e76616c6964206e6f6d206f722064656e6f6d2076616c756560301b604482015260640161050f565b604080518381526020810183905233917fcd3db955892df8543ef392cb55c3f36e13ad4c38e151c8315101b3006ef105df910160405180910390a25050565b600080609c54601b6111879190611dbc565b905061119481600a611fea565b61119d85611464565b6111b285676765c793fa10079d601b1b611e7f565b6111bc9190611eb4565b610d219190611eb4565b60006111d0611555565b6111d9836116f2565b60006111e58484610c3f565b6001600160a01b0385166000908152609a602052604081206002810180549394509092849290611216908490612044565b909155505080548490829060009061122f908490612044565b9091555050600281015481546040516001600160a01b03881692339260008051602061213f83398151915292611268928a928992611dd3565b60405180910390a3509392505050565b611280611555565b611289826116f2565b6000826001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156112c457600080fd5b505afa1580156112d8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112fc9190611ee3565b61130a9060ff16601b611dbc565b6001600160a01b0384166000908152609a6020526040812091925061132e85611464565b9050838260020160008282546113449190612044565b90915550611355905083600a611fea565b8183600201546113659190611e7f565b835461137c90676765c793fa10079d601b1b611e7f565b6113869190611eb4565b6113909190611eb4565b600192909201805463ffffffff191663ffffffff9093169290921790915550505050565b60675460405163bf40fac160e01b815260206004820152600a60248201526923a7a7a22227a62620a960b11b60448201526000916001600160a01b03169063bf40fac190606401610f74565b600061140a611555565b611413826116f2565b600061141e8361092a565b6001600160a01b0384166000908152609a602052604081206002018054929350839290919061144e908490612044565b9091555061145d905083610ae1565b5092915050565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff16938101939093526002810154918301919091526003015460608201526114ba610f28565b6001600160a01b03166349f9b0f7826040015183600001518460200151609c54600a6114e69190611fea565b6040518563ffffffff1660e01b8152600401611505949392919061200a565b60206040518083038186803b15801561151d57600080fd5b505afa158015611531573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610625919061202b565b60675460405163bf40fac160e01b81526020600482015260076024820152665245534552564560c81b604482015233916001600160a01b03169063bf40fac19060640160206040518083038186803b1580156115b057600080fd5b505afa1580156115c4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115e89190611dee565b6001600160a01b03161480611695575060675460405163bf40fac160e01b815260206004820152600660248201526520ab20aa20a960d11b604482015233916001600160a01b03169063bf40fac19060640160206040518083038186803b15801561165257600080fd5b505afa158015611666573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061168a9190611dee565b6001600160a01b0316145b6116f05760405162461bcd60e51b815260206004820152602660248201527f476f6f644d61726b65744d616b65723a206e6f742052657365727665206f722060448201526520bb30ba30b960d11b606482015260840161050f565b565b6001600160a01b0381166000908152609a602052604090206002810154610c3b5760405162461bcd60e51b815260206004820152601d60248201527f5265736572766520746f6b656e206e6f7420696e697469616c697a6564000000604482015260640161050f565b6000805160206120f8833981519152546001600160a01b031690565b6108376118e9565b600061178961175b565b9050611794846119bb565b6000835111806117a15750815b156117b2576117b08484611a4e565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff166118bf57805460ff1916600117815560405161182d9086906117fe908590602401611c10565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052611a4e565b50805460ff1916815561183e61175b565b6001600160a01b0316826001600160a01b0316146118b65760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b606482015260840161050f565b6118bf85611b30565b5050505050565b606780546001600160a01b0319166001600160a01b03831617905561083761062c565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561192d57600080fd5b505afa158015611941573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119659190611dee565b6001600160a01b0316146116f05760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f64604482015260640161050f565b803b611a1f5760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b606482015260840161050f565b6000805160206120f883398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b611aad5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b606482015260840161050f565b600080846001600160a01b031684604051611ac89190612088565b600060405180830381855af49150503d8060008114611b03576040519150601f19603f3d011682016040523d82523d6000602084013e611b08565b606091505b5091509150610921828260405180606001604052806027815260200161211860279139611b70565b611b39816119bb565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60608315611b7f575081610625565b825115611b8f5782518084602001fd5b8160405162461bcd60e51b815260040161050f91906120a4565b6001600160a01b038116811461083757600080fd5b600080600060608486031215611bd357600080fd5b8335611bde81611ba9565b95602085013595506040909401359392505050565b600060208284031215611c0557600080fd5b813561062581611ba9565b6001600160a01b0391909116815260200190565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215611c4d57600080fd5b8235611c5881611ba9565b915060208301356001600160401b0380821115611c7457600080fd5b818501915085601f830112611c8857600080fd5b813581811115611c9a57611c9a611c24565b604051601f8201601f19908116603f01168101908382118183101715611cc257611cc2611c24565b81604052828152886020848701011115611cdb57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b60008060408385031215611d1057600080fd5b8235611d1b81611ba9565b946020939093013593505050565b600080600080600060a08688031215611d4157600080fd5b8535611d4c81611ba9565b94506020860135935060408601359250606086013563ffffffff81168114611d7357600080fd5b949793965091946080013592915050565b60008060408385031215611d9757600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b600082821015611dce57611dce611da6565b500390565b93845260208401929092526040830152606082015260800190565b600060208284031215611e0057600080fd5b815161062581611ba9565b6020808252602c908201526000805160206120d883398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c908201526000805160206120d883398151915260408201526b6163746976652070726f787960a01b606082015260800190565b6000816000190483118215151615611e9957611e99611da6565b500290565b634e487b7160e01b600052601260045260246000fd5b600082611ec357611ec3611e9e565b500490565b6000600019821415611edc57611edc611da6565b5060010190565b600060208284031215611ef557600080fd5b815160ff8116811461062557600080fd5b600181815b80851115611f41578160001904821115611f2757611f27611da6565b80851615611f3457918102915b93841c9390800290611f0b565b509250929050565b600082611f5857506001610d25565b81611f6557506000610d25565b8160018114611f7b5760028114611f8557611fa1565b6001915050610d25565b60ff841115611f9657611f96611da6565b50506001821b610d25565b5060208310610133831016604e8410600b8410161715611fc4575081810a610d25565b611fce8383611f06565b8060001904821115611fe257611fe2611da6565b029392505050565b60006106258383611f49565b60008261200557612005611e9e565b500690565b938452602084019290925263ffffffff166040830152606082015260800190565b60006020828403121561203d57600080fd5b5051919050565b6000821982111561205757612057611da6565b500190565b60005b8381101561207757818101518382015260200161205f565b83811115610f225750506000910152565b6000825161209a81846020870161205c565b9190910192915050565b60208152600082518060208401526120c381604085016020870161205c565b601f01601f1916919091016040019291505056fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564ed639966d5b0a89f5ac16d6359c7707785de6e51a00f07dd3197e5fbf0a30374a2646970667358221220f684e94cb7bc5b87fd29740e2af313c795a7d904bc6b17f621828d088a3e552364736f6c63430008080033";var deployedBytecode$1="0x6080604052600436106101265760003560e01c80630b1848661461012b5780631b3c90a81461015e5780633659cfe614610175578063371d52dc146101955780633e21374e146101ca5780633e6326fc146101ea5780634162169f1461021757806346f7cb23146102375780634f1ef286146102575780635aef7de61461026a5780635cf3a7a91461028a5780636a989e6e146102aa5780636cb4b4c1146102ca57806374920d30146102e05780637a1ac61e14610300578063835bbd55146103205780638c4959621461038e5780638ee090fb146103a35780639f2d0d07146103c3578063bc179d45146103e3578063cce7ec1314610403578063d5dc7eda14610423578063e1758bd814610443578063e72a083314610458578063e9833c2f14610478575b600080fd5b34801561013757600080fd5b5061014b610146366004611bbe565b610498565b6040519081526020015b60405180910390f35b34801561016a57600080fd5b5061017361062c565b005b34801561018157600080fd5b50610173610190366004611bf3565b610771565b3480156101a157600080fd5b506101b56101b0366004611bf3565b61083a565b60405163ffffffff9091168152602001610155565b3480156101d657600080fd5b5061014b6101e5366004611bf3565b61092a565b3480156101f657600080fd5b5060675461020a906001600160a01b031681565b6040516101559190611c10565b34801561022357600080fd5b5060655461020a906001600160a01b031681565b34801561024357600080fd5b506101b5610252366004611bf3565b610ae1565b610173610265366004611c3a565b610b85565b34801561027657600080fd5b5060665461020a906001600160a01b031681565b34801561029657600080fd5b5061014b6102a5366004611cfd565b610c3f565b3480156102b657600080fd5b5061014b6102c5366004611cfd565b610d2b565b3480156102d657600080fd5b5061014b609b5481565b3480156102ec57600080fd5b5061014b6102fb366004611cfd565b610dbd565b34801561030c57600080fd5b5061017361031b366004611bbe565b610e41565b34801561032c57600080fd5b5061036961033b366004611bf3565b609a602052600090815260409020805460018201546002830154600390930154919263ffffffff9091169184565b6040805194855263ffffffff9093166020850152918301526060820152608001610155565b34801561039a57600080fd5b5061020a610f28565b3480156103af57600080fd5b506101736103be366004611d29565b610fc9565b3480156103cf57600080fd5b506101736103de366004611d84565b611065565b3480156103ef57600080fd5b5061014b6103fe366004611cfd565b611175565b34801561040f57600080fd5b5061014b61041e366004611cfd565b6111c6565b34801561042f57600080fd5b5061017361043e366004611cfd565b611278565b34801561044f57600080fd5b5061020a6113b4565b34801561046457600080fd5b5061014b610473366004611bf3565b611400565b34801561048457600080fd5b5061014b610493366004611bf3565b611464565b60006104a2611555565b6104ab846116f2565b818310156105185760405162461bcd60e51b815260206004820152602f60248201527f474420616d6f756e74206973206c6f776572207468616e2074686520636f6e7460448201526e1c9a589d5d1a5bdb88185b5bdd5b9d608a1b60648201526084015b60405180910390fd5b6001600160a01b0384166000908152609a6020526040902060028101548411156105965760405162461bcd60e51b815260206004820152602960248201527f474420616d6f756e7420697320686967686572207468616e2074686520746f74604482015268616c20737570706c7960b81b606482015260840161050f565b60006105a28486611dbc565b905060006105b08783610d2b565b9050858360020160008282546105c69190611dbc565b90915550508254819084906000906105df908490611dbc565b9091555050600283015483546040516001600160a01b038a1692339260008051602061213f83398151915292610618928b928892611dd3565b60405180910390a3925050505b9392505050565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b15801561068a57600080fd5b505afa15801561069e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106c29190611dee565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561071757600080fd5b505afa15801561072b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074f9190611dee565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156107ba5760405162461bcd60e51b815260040161050f90611e0b565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166107ec61175b565b6001600160a01b0316146108125760405162461bcd60e51b815260040161050f90611e45565b61081b81611777565b604080516000808252602082019092526108379183919061177f565b50565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810184905260028201549281019290925260030154606082015290806108935750620f42405b6108a6683635c9adc5dea0000082611e7f565b90506000620151808360600151426108be9190611dbc565b6108c89190611eb4565b905060005b8181101561090d57676765c793fa10079d601b1b609b54846108ef9190611e7f565b6108f99190611eb4565b92508061090581611ec8565b9150506108cd565b50610921683635c9adc5dea0000083611eb4565b95945050505050565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152816109828461083a565b90506000846001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156109bf57600080fd5b505afa1580156109d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f79190611ee3565b610a059060ff16601b611dbc565b90506000676765c793fa10079d601b1b610a2083600a611fea565b610a2988611464565b610a4263ffffffff8716683635c9adc5dea00000611e7f565b610a4c9190611e7f565b610a569190611e7f565b610a609190611eb4565b90506000609c54601b610a739190611dbc565b90506000610a8282600a611fea565b83610a8e86600a611fea565b8851610a9a9190611e7f565b610aaf90676765c793fa10079d601b1b611e7f565b610ab99190611eb4565b610ac39190611eb4565b9050856040015181610ad59190611dbc565b98975050505050505050565b6000610aeb611555565b610af4826116f2565b6001600160a01b0382166000908152609a60205260409020600181015463ffffffff1680610b225750620f42405b610b2b8461083a565b60018301805463ffffffff191663ffffffff9290921691909117905560038201546201518090610b5b9042611dbc565b610b659190611ff6565b610b6f9042611dbc565b6003830155506001015463ffffffff1692915050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610bce5760405162461bcd60e51b815260040161050f90611e0b565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610c0061175b565b6001600160a01b031614610c265760405162461bcd60e51b815260040161050f90611e45565b610c2f82611777565b610c3b8282600161177f565b5050565b6001600160a01b0382166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152610c95610f28565b604080830151835160208501519251630a68039f60e21b81526001600160a01b0394909416936329a00e7c93610cd1939291899060040161200a565b60206040518083038186803b158015610ce957600080fd5b505afa158015610cfd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d21919061202b565b9150505b92915050565b6001600160a01b0382166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff1693810193909352600281015491830191909152600301546060820152610d81610f28565b6040808301518351602085015192516349f9b0f760e01b81526001600160a01b0394909416936349f9b0f793610cd1939291899060040161200a565b6000610dc7611555565b610dd0836116f2565b81610ddd57506000610d25565b6000610de98484611175565b6001600160a01b0385166000908152609a602052604081206002810180549394509092849290610e1a908490612044565b9091555050805484908290600090610e33908490612044565b909155509195945050505050565b600054610100900460ff1680610e5a575060005460ff16155b610ebd5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b606482015260840161050f565b600054610100900460ff16158015610edf576000805461ffff19166101011790555b81610ef584676765c793fa10079d601b1b611e7f565b610eff9190611eb4565b609b556002609c55610f10846118c6565b8015610f22576000805461ff00191690555b50505050565b60675460405163bf40fac160e01b815260206004820152600e60248201526d42414e434f525f464f524d554c4160901b60448201526000916001600160a01b03169063bf40fac1906064015b60206040518083038186803b158015610f8c57600080fd5b505afa158015610fa0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fc49190611dee565b905090565b610fd1611555565b60405180608001604052808481526020018363ffffffff168152602001858152602001826000146110025782611004565b425b90526001600160a01b03959095166000908152609a6020908152604091829020875181559087015160018201805463ffffffff191663ffffffff90921691909117905590860151600282015560609095015160039095019490945550505050565b61106d611555565b600081116110bb5760405162461bcd60e51b815260206004820152601b60248201527a064656e6f6d696e61746f72206d7573742062652061626f7665203602c1b604482015260640161050f565b806110d183676765c793fa10079d601b1b611e7f565b6110db9190611eb4565b609b819055676765c793fa10079d601b1b116111365760405162461bcd60e51b815260206004820152601a602482015279496e76616c6964206e6f6d206f722064656e6f6d2076616c756560301b604482015260640161050f565b604080518381526020810183905233917fcd3db955892df8543ef392cb55c3f36e13ad4c38e151c8315101b3006ef105df910160405180910390a25050565b600080609c54601b6111879190611dbc565b905061119481600a611fea565b61119d85611464565b6111b285676765c793fa10079d601b1b611e7f565b6111bc9190611eb4565b610d219190611eb4565b60006111d0611555565b6111d9836116f2565b60006111e58484610c3f565b6001600160a01b0385166000908152609a602052604081206002810180549394509092849290611216908490612044565b909155505080548490829060009061122f908490612044565b9091555050600281015481546040516001600160a01b03881692339260008051602061213f83398151915292611268928a928992611dd3565b60405180910390a3509392505050565b611280611555565b611289826116f2565b6000826001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156112c457600080fd5b505afa1580156112d8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112fc9190611ee3565b61130a9060ff16601b611dbc565b6001600160a01b0384166000908152609a6020526040812091925061132e85611464565b9050838260020160008282546113449190612044565b90915550611355905083600a611fea565b8183600201546113659190611e7f565b835461137c90676765c793fa10079d601b1b611e7f565b6113869190611eb4565b6113909190611eb4565b600192909201805463ffffffff191663ffffffff9093169290921790915550505050565b60675460405163bf40fac160e01b815260206004820152600a60248201526923a7a7a22227a62620a960b11b60448201526000916001600160a01b03169063bf40fac190606401610f74565b600061140a611555565b611413826116f2565b600061141e8361092a565b6001600160a01b0384166000908152609a602052604081206002018054929350839290919061144e908490612044565b9091555061145d905083610ae1565b5092915050565b6001600160a01b0381166000908152609a60209081526040808320815160808101835281548152600182015463ffffffff16938101939093526002810154918301919091526003015460608201526114ba610f28565b6001600160a01b03166349f9b0f7826040015183600001518460200151609c54600a6114e69190611fea565b6040518563ffffffff1660e01b8152600401611505949392919061200a565b60206040518083038186803b15801561151d57600080fd5b505afa158015611531573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610625919061202b565b60675460405163bf40fac160e01b81526020600482015260076024820152665245534552564560c81b604482015233916001600160a01b03169063bf40fac19060640160206040518083038186803b1580156115b057600080fd5b505afa1580156115c4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115e89190611dee565b6001600160a01b03161480611695575060675460405163bf40fac160e01b815260206004820152600660248201526520ab20aa20a960d11b604482015233916001600160a01b03169063bf40fac19060640160206040518083038186803b15801561165257600080fd5b505afa158015611666573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061168a9190611dee565b6001600160a01b0316145b6116f05760405162461bcd60e51b815260206004820152602660248201527f476f6f644d61726b65744d616b65723a206e6f742052657365727665206f722060448201526520bb30ba30b960d11b606482015260840161050f565b565b6001600160a01b0381166000908152609a602052604090206002810154610c3b5760405162461bcd60e51b815260206004820152601d60248201527f5265736572766520746f6b656e206e6f7420696e697469616c697a6564000000604482015260640161050f565b6000805160206120f8833981519152546001600160a01b031690565b6108376118e9565b600061178961175b565b9050611794846119bb565b6000835111806117a15750815b156117b2576117b08484611a4e565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff166118bf57805460ff1916600117815560405161182d9086906117fe908590602401611c10565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052611a4e565b50805460ff1916815561183e61175b565b6001600160a01b0316826001600160a01b0316146118b65760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b606482015260840161050f565b6118bf85611b30565b5050505050565b606780546001600160a01b0319166001600160a01b03831617905561083761062c565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561192d57600080fd5b505afa158015611941573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119659190611dee565b6001600160a01b0316146116f05760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f64604482015260640161050f565b803b611a1f5760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b606482015260840161050f565b6000805160206120f883398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b611aad5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b606482015260840161050f565b600080846001600160a01b031684604051611ac89190612088565b600060405180830381855af49150503d8060008114611b03576040519150601f19603f3d011682016040523d82523d6000602084013e611b08565b606091505b5091509150610921828260405180606001604052806027815260200161211860279139611b70565b611b39816119bb565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60608315611b7f575081610625565b825115611b8f5782518084602001fd5b8160405162461bcd60e51b815260040161050f91906120a4565b6001600160a01b038116811461083757600080fd5b600080600060608486031215611bd357600080fd5b8335611bde81611ba9565b95602085013595506040909401359392505050565b600060208284031215611c0557600080fd5b813561062581611ba9565b6001600160a01b0391909116815260200190565b634e487b7160e01b600052604160045260246000fd5b60008060408385031215611c4d57600080fd5b8235611c5881611ba9565b915060208301356001600160401b0380821115611c7457600080fd5b818501915085601f830112611c8857600080fd5b813581811115611c9a57611c9a611c24565b604051601f8201601f19908116603f01168101908382118183101715611cc257611cc2611c24565b81604052828152886020848701011115611cdb57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b60008060408385031215611d1057600080fd5b8235611d1b81611ba9565b946020939093013593505050565b600080600080600060a08688031215611d4157600080fd5b8535611d4c81611ba9565b94506020860135935060408601359250606086013563ffffffff81168114611d7357600080fd5b949793965091946080013592915050565b60008060408385031215611d9757600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b600082821015611dce57611dce611da6565b500390565b93845260208401929092526040830152606082015260800190565b600060208284031215611e0057600080fd5b815161062581611ba9565b6020808252602c908201526000805160206120d883398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c908201526000805160206120d883398151915260408201526b6163746976652070726f787960a01b606082015260800190565b6000816000190483118215151615611e9957611e99611da6565b500290565b634e487b7160e01b600052601260045260246000fd5b600082611ec357611ec3611e9e565b500490565b6000600019821415611edc57611edc611da6565b5060010190565b600060208284031215611ef557600080fd5b815160ff8116811461062557600080fd5b600181815b80851115611f41578160001904821115611f2757611f27611da6565b80851615611f3457918102915b93841c9390800290611f0b565b509250929050565b600082611f5857506001610d25565b81611f6557506000610d25565b8160018114611f7b5760028114611f8557611fa1565b6001915050610d25565b60ff841115611f9657611f96611da6565b50506001821b610d25565b5060208310610133831016604e8410600b8410161715611fc4575081810a610d25565b611fce8383611f06565b8060001904821115611fe257611fe2611da6565b029392505050565b60006106258383611f49565b60008261200557612005611e9e565b500690565b938452602084019290925263ffffffff166040830152606082015260800190565b60006020828403121561203d57600080fd5b5051919050565b6000821982111561205757612057611da6565b500190565b60005b8381101561207757818101518382015260200161205f565b83811115610f225750506000910152565b6000825161209a81846020870161205c565b9190910192915050565b60208152600082518060208401526120c381604085016020870161205c565b601f01601f1916919091016040019291505056fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564ed639966d5b0a89f5ac16d6359c7707785de6e51a00f07dd3197e5fbf0a30374a2646970667358221220f684e94cb7bc5b87fd29740e2af313c795a7d904bc6b17f621828d088a3e552364736f6c63430008080033";var linkReferences$1={};var deployedLinkReferences$1={};var GoodMarketMaker = {_format:_format$1,contractName:contractName$1,sourceName:sourceName$1,abi:abi$2,bytecode:bytecode$1,deployedBytecode:deployedBytecode$1,linkReferences:linkReferences$1,deployedLinkReferences:deployedLinkReferences$1};

/**
 * Returns instance of GoodMarket contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
function goodMarketMakerContract(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(address !== null && address !== void 0)) return [3 /*break*/, 1];
                    _a = address;
                    return [3 /*break*/, 3];
                case 1:
                    _b = G$ContractAddresses;
                    return [4 /*yield*/, getChainId(web3)];
                case 2:
                    _a = _b.apply(void 0, [_c.sent(), 'GoodMarketMaker']);
                    _c.label = 3;
                case 3:
                    address = _a;
                    return [2 /*return*/, new web3.eth.Contract(GoodMarketMaker.abi, address)];
            }
        });
    });
}

/**
 * Returns COMPOUND staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenAddress Token address.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
var compoundStaking = memoize_1(function (chainId, tokenAddress) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, supplyRate, compSupplyAPY, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fetch("https://api.compound.finance/api/v2/ctoken?addresses=".concat(tokenAddress, "&network=").concat(NETWORK_LABELS[chainId]))
                    .then(function (r) { return r.json(); })
                    .then(function (r) { return [r.cToken[0].supply_rate.value, r.cToken[0].comp_supply_apy.value]; })
                    .catch(function () { return ['0', '0']; })];
            case 1:
                _a = __read.apply(void 0, [_b.sent(), 2]), supplyRate = _a[0], compSupplyAPY = _a[1];
                if (parseFloat(compSupplyAPY) > 100) {
                    compSupplyAPY = '0';
                }
                if (parseFloat(supplyRate) > 1) {
                    supplyRate = '0';
                }
                result = {
                    supplyAPY: decimalToFraction(supplyRate),
                    incentiveAPY: decimalToFraction(compSupplyAPY)
                };
                debug('Supply Rate', result.supplyAPY.toSignificant(6));
                debug('Compound Supply APY', result.incentiveAPY.toSignificant(6));
                delayedCacheClear(compoundStaking);
                return [2 /*return*/, result];
        }
    });
}); }, function (chainId, tokenAddress) { return chainId + tokenAddress; });

var _format="hh-sol-artifact-1";var contractName="StakersDistribution";var sourceName="contracts/governance/StakersDistribution.sol";var abi$1=[{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"previousAdmin",type:"address"},{indexed:false,internalType:"address",name:"newAdmin",type:"address"}],name:"AdminChanged",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"beacon",type:"address"}],name:"BeaconUpgraded",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"staker",type:"address"},{indexed:false,internalType:"address[]",name:"stakingContracts",type:"address[]"},{indexed:false,internalType:"uint256",name:"reputation",type:"uint256"}],name:"ReputationEarned",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"implementation",type:"address"}],name:"Upgraded",type:"event"},{inputs:[],name:"avatar",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_staker",type:"address"},{internalType:"address[]",name:"_stakingContracts",type:"address[]"}],name:"claimReputation",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"},{internalType:"address",name:"",type:"address"}],name:"contractToUsers",outputs:[{internalType:"uint128",name:"amount",type:"uint128"},{internalType:"uint128",name:"rewardDebt",type:"uint128"},{internalType:"uint128",name:"rewardEarn",type:"uint128"},{internalType:"uint128",name:"rewardMinted",type:"uint128"}],stateMutability:"view",type:"function"},{inputs:[],name:"currentMonth",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"dao",outputs:[{internalType:"contract Controller",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getChainBlocksPerMonth",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"pure",type:"function"},{inputs:[{internalType:"address",name:"_contract",type:"address"},{internalType:"address",name:"_user",type:"address"}],name:"getProductivity",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address[]",name:"_contracts",type:"address[]"},{internalType:"address",name:"_user",type:"address"}],name:"getUserMintedAndPending",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_contract",type:"address"},{internalType:"uint256",name:"_blockStart",type:"uint256"},{internalType:"uint256",name:"_blockEnd",type:"uint256"},{internalType:"address",name:"_user",type:"address"}],name:"getUserPendingReward",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address[]",name:"_contracts",type:"address[]"},{internalType:"address",name:"_user",type:"address"}],name:"getUserPendingRewards",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract INameService",name:"_ns",type:"address"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"lastRewardBlock",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"monthlyReputationDistribution",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"nameService",outputs:[{internalType:"contract INameService",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"nativeToken",outputs:[{internalType:"contract IGoodDollar",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"rewardsMintedSoFar",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"rewardsPerBlock",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"newMonthlyReputationDistribution",type:"uint256"}],name:"setMonthlyReputationDistribution",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"totalRewardsAccumulated",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"_contract",type:"address"}],name:"totalRewardsPerShare",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"updateAvatar",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"}],name:"upgradeTo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"},{internalType:"bytes",name:"data",type:"bytes"}],name:"upgradeToAndCall",outputs:[],stateMutability:"payable",type:"function"},{inputs:[{internalType:"address",name:"_staker",type:"address"},{internalType:"uint256",name:"_value",type:"uint256"}],name:"userStaked",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"_staker",type:"address"},{internalType:"uint256",name:"_value",type:"uint256"}],name:"userWithdraw",outputs:[],stateMutability:"nonpayable",type:"function"}];var bytecode="0x60a06040523060601b60805234801561001757600080fd5b5060805160601c6128d561004b600039600081816107390152818161078201528181610aa70152610ae701526128d56000f3fe6080604052600436106101265760003560e01c806305a6aafa1461012b5780631b3c90a81461014d578063213b329e1461016257806322dec37b146101875780632d36bd88146101b45780632e42a896146101e957806331903da11461027b5780633659cfe6146102a85780633c8c043a146102c85780633d9a12cc146102de5780633e458a8e146102fe5780633e6326fc1461031e5780634162169f1461034b57806347b3e7e81461036b5780634f1db7f6146103985780634f1ef286146103f657806352e62ac2146104095780635aef7de6146104295780637bcbb9ff14610449578063846141b31461047f578063862a4d47146104ac5780638aaa31de146104c2578063a39b2153146104e2578063c4d66de814610502578063e1758bd814610522575b600080fd5b34801561013757600080fd5b5061014b6101463660046121b0565b610537565b005b34801561015957600080fd5b5061014b610544565b34801561016e57600080fd5b506202a3005b6040519081526020015b60405180910390f35b34801561019357600080fd5b506101746101a23660046121ee565b609c6020526000908152604090205481565b3480156101c057600080fd5b506101d46101cf366004612251565b610689565b6040805192835260208301919091520161017e565b3480156101f557600080fd5b50610248610204366004612314565b60a0602090815260009283526040808420909152908252902080546001909101546001600160801b0380831692600160801b90819004821692808316929190041684565b604080516001600160801b039586168152938516602085015291841691830191909152909116606082015260800161017e565b34801561028757600080fd5b506101746102963660046121ee565b609d6020526000908152604090205481565b3480156102b457600080fd5b5061014b6102c33660046121ee565b61072e565b3480156102d457600080fd5b5061017460d35481565b3480156102ea57600080fd5b506101746102f936600461234d565b610800565b34801561030a57600080fd5b5061014b610319366004612397565b6108f4565b34801561032a57600080fd5b5060675461033e906001600160a01b031681565b60405161017e91906123c3565b34801561035757600080fd5b5060655461033e906001600160a01b031681565b34801561037757600080fd5b506101746103863660046121ee565b609f6020526000908152604090205481565b3480156103a457600080fd5b506101d46103b3366004612314565b6001600160a01b03918216600081815260a06020908152604080832094909516825292835283812054918152609a909252919020546001600160801b0390911691565b61014b6104043660046123d7565b610a9c565b34801561041557600080fd5b50610174610424366004612251565b610b56565b34801561043557600080fd5b5060665461033e906001600160a01b031681565b34801561045557600080fd5b506101746104643660046121ee565b6001600160a01b03166000908152609b602052604090205490565b34801561048b57600080fd5b5061017461049a3660046121ee565b609e6020526000908152604090205481565b3480156104b857600080fd5b5061017460d45481565b3480156104ce57600080fd5b5061014b6104dd36600461247e565b610ceb565b3480156104ee57600080fd5b5061014b6104fd366004612397565b610d2d565b34801561050e57600080fd5b5061014b61051d3660046121ee565b610e63565b34801561052e57600080fd5b5061033e610f2d565b61053f610fc9565b60d355565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156105a257600080fd5b505afa1580156105b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105da9190612505565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561062f57600080fd5b505afa158015610643573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106679190612505565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b60008060006106988585610b56565b90506000805b86518110156107235760a060008883815181106106bd576106bd612522565b6020908102919091018101516001600160a01b0390811683528282019390935260409182016000908120938a16815292905290206001015461070f90600160801b90046001600160801b03168361254e565b91508061071b81612566565b91505061069e565b509590945092505050565b306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156107805760405162461bcd60e51b815260040161077790612581565b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166107b261109d565b6001600160a01b0316146107d85760405162461bcd60e51b8152600401610777906125bb565b6107e1816110b9565b604080516000808252602082019092526107fd918391906110c1565b50565b6001600160a01b03808516600081815260a0602090815260408083209486168352938152838220845160808101865281546001600160801b038082168352600160801b9182900481168386015260019093015480841683890152049091166060820152928252609a9052918220548290156108ea576000610882888888611208565b91505082604001516001600160801b0316915082602001516001600160801b0316676765c793fa10079d601b1b8285600001516001600160801b03166108c891906125f5565b6108d29190612614565b6108dc9190612636565b6108e6908361254e565b9150505b9695505050505050565b60675460405163bf40fac160e01b81523391600091829182916001600160a01b039091169063bf40fac19061092b9060040161264d565b60206040518083038186803b15801561094357600080fd5b505afa158015610957573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061097b9190612505565b6001600160a01b031663d0250144856040518263ffffffff1660e01b81526004016109a691906123c3565b60806040518083038186803b1580156109be57600080fd5b505afa1580156109d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f6919061269a565b935093509350508015610a0b57505050505050565b610a2a848787866001600160401b0316866001600160401b0316611300565b50604080516001808252818301909252600091602080830190803683370190505090508481600081518110610a6157610a61612522565b60200260200101906001600160a01b031690816001600160a01b031681525050610a8b878261139d565b610a93611693565b50505050505050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610ae55760405162461bcd60e51b815260040161077790612581565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610b1761109d565b6001600160a01b031614610b3d5760405162461bcd60e51b8152600401610777906125bb565b610b46826110b9565b610b52828260016110c1565b5050565b60008060005b8451811015610ce35760675460405163bf40fac160e01b8152600091829182916001600160a01b03169063bf40fac190610b989060040161264d565b60206040518083038186803b158015610bb057600080fd5b505afa158015610bc4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610be89190612505565b6001600160a01b031663d0250144898681518110610c0857610c08612522565b60200260200101516040518263ffffffff1660e01b8152600401610c2c91906123c3565b60806040518083038186803b158015610c4457600080fd5b505afa158015610c58573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c7c919061269a565b919550935091505080610ccd57610cc0888581518110610c9e57610c9e612522565b6020026020010151846001600160401b0316846001600160401b03168a610800565b610cca908661254e565b94505b5050508080610cdb90612566565b915050610b5c565b509392505050565b610d288383838080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525061139d92505050565b505050565b60675460405163bf40fac160e01b81523391600091829182916001600160a01b039091169063bf40fac190610d649060040161264d565b60206040518083038186803b158015610d7c57600080fd5b505afa158015610d90573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610db49190612505565b6001600160a01b031663d0250144856040518263ffffffff1660e01b8152600401610ddf91906123c3565b60806040518083038186803b158015610df757600080fd5b505afa158015610e0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2f919061269a565b935093509350508015610e4457505050505050565b610a2a848787866001600160401b0316866001600160401b0316611bc3565b600054610100900460ff1680610e7c575060005460ff16155b610edf5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610777565b600054610100900460ff16158015610f01576000805461ffff19166101011790555b66d3c21bcecceda160191b60d355610f1882611c36565b8015610b52576000805461ff00191690555050565b60675460405163bf40fac160e01b815260206004820152600a60248201526923a7a7a22227a62620a960b11b60448201526000916001600160a01b03169063bf40fac19060640160206040518083038186803b158015610f8c57600080fd5b505afa158015610fa0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fc49190612505565b905090565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561100d57600080fd5b505afa158015611021573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110459190612505565b6001600160a01b03161461109b5760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f646044820152606401610777565b565b600080516020612859833981519152546001600160a01b031690565b6107fd610fc9565b60006110cb61109d565b90506110d684611c59565b6000835111806110e35750815b156110f4576110f28484611cec565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff1661120157805460ff1916600117815560405161116f9086906111409085906024016123c3565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052611cec565b50805460ff1916815561118061109d565b6001600160a01b0316826001600160a01b0316146111f85760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b6064820152608401610777565b61120185611dd7565b5050505050565b6001600160a01b0383166000908152609b6020908152604080832054609e9092529091205490838210801561123d5750834310155b6112475781611249565b835b9150600083431161125a574361125c565b835b90508481108061126c5750838310155b1561127757506112f8565b60006112838483612636565b6001600160a01b0388166000908152609f6020526040812054919250906112aa90836125f5565b6001600160a01b0389166000908152609a60205260409020549091506112db82676765c793fa10079d601b1b6125f5565b6112e59190612614565b6112ef908561254e565b93508294505050505b935093915050565b600061130d868484611e17565b6001600160a01b03808716600090815260a06020908152604080832093891683529290522054611354908790879061134f9088906001600160801b0316612636565b611e92565b6001600160a01b0386166000908152609a6020526040902054611378908590612636565b6001600160a01b0387166000908152609a602052604090205550600195945050505050565b60675460405163bf40fac160e01b815260009182916001600160a01b039091169063bf40fac1906113d09060040161264d565b60206040518083038186803b1580156113e857600080fd5b505afa1580156113fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114209190612505565b905060005b835181101561152f576000806000846001600160a01b031663d025014488868151811061145457611454612522565b60200260200101516040518263ffffffff1660e01b815260040161147891906123c3565b60806040518083038186803b15801561149057600080fd5b505afa1580156114a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114c8919061269a565b9195509350915050806115195761150c8785815181106114ea576114ea612522565b602002602001015189856001600160401b0316856001600160401b031661200e565b611516908761254e565b95505b505050808061152790612566565b915050611425565b50811561168d5760675460405163bf40fac160e01b815260206004820152600a6024820152692922a82aaa20aa24a7a760b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b15801561159457600080fd5b505afa1580156115a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115cc9190612505565b6040516340c10f1960e01b81526001600160a01b0386811660048301526024820185905291909116906340c10f1990604401602060405180830381600087803b15801561161857600080fd5b505af115801561162c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061165091906126f9565b507fb5bb6cf2a7d73ab2167d87f348feea953c3e405a4ece2a262cd92cdce829f6d284848460405161168493929190612714565b60405180910390a15b50505050565b60675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac1906116c29060040161264d565b60206040518083038186803b1580156116da57600080fd5b505afa1580156116ee573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117129190612505565b6001600160a01b03161461109b5760675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac19061174f9060040161264d565b60206040518083038186803b15801561176757600080fd5b505afa15801561177b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061179f9190612505565b90506000816001600160a01b0316630e47dbd96040518163ffffffff1660e01b815260040160206040518083038186803b1580156117dc57600080fd5b505afa1580156117f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118149190612779565b90506000816001600160401b038111156118305761183061220b565b604051908082528060200260200182016040528015611859578160200160208202803683370190505b5090506000826001600160401b038111156118765761187661220b565b60405190808252806020026020018201604052801561189f578160200160208202803683370190505b5090506000805b84811015611b07576040516372d00e9f60e01b8152600481018290526001600160a01b038716906372d00e9f9060240160206040518083038186803b1580156118ee57600080fd5b505afa158015611902573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119269190612505565b84828151811061193857611938612522565b60200260200101906001600160a01b031690816001600160a01b031681525050600080876001600160a01b031663d025014487858151811061197c5761197c612522565b60200260200101516040518263ffffffff1660e01b81526004016119a091906123c3565b60806040518083038186803b1580156119b857600080fd5b505afa1580156119cc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119f0919061269a565b50925092505043826001600160401b031611158015611a17575043816001600160401b0316115b15611af2576000868481518110611a3057611a30612522565b60200260200101516001600160a01b031663e99b5d3d6040518163ffffffff1660e01b815260040160206040518083038186803b158015611a7057600080fd5b505afa158015611a84573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa89190612779565b905080868581518110611abd57611abd612522565b602002602001018181525050858481518110611adb57611adb612522565b602002602001015185611aee919061254e565b9450505b50508080611aff90612566565b9150506118a6565b5060005b84811015611bbb576000808311611b2f578560d354611b2a9190612614565b611b61565b82848381518110611b4257611b42612522565b602002602001015160d354611b5791906125f5565b611b619190612614565b90506000848381518110611b7757611b77612522565b60200260200101511115611ba857611ba8858381518110611b9a57611b9a612522565b602002602001015182612143565b5080611bb381612566565b915050611b0b565b505050505050565b6000611bd0868484611e17565b6001600160a01b03808716600090815260a06020908152604080832093891683529290522054611c12908790879061134f9088906001600160801b031661254e565b6001600160a01b0386166000908152609a602052604090205461137890859061254e565b606780546001600160a01b0319166001600160a01b0383161790556107fd610544565b803b611cbd5760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401610777565b60008051602061285983398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b611d4b5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401610777565b600080846001600160a01b031684604051611d6691906127be565b600060405180830381855af49150503d8060008114611da1576040519150601f19603f3d011682016040523d82523d6000602084013e611da6565b606091505b5091509150611dce828260405180606001604052806027815260200161287960279139612170565b95945050505050565b611de081611c59565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b6001600160a01b0383166000908152609a6020526040902054611e525750506001600160a01b03166000908152609e60205260409020439055565b600080611e60858585611208565b6001600160a01b039096166000908152609b6020908152604080832098909855609e9052959095209490945550505050565b6001600160a01b03808416600090815260a06020908152604080832093861683529290522080546001600160801b031615611f9e5780546001600160a01b0385166000908152609b602052604081205490916001600160801b03600160801b8204811692676765c793fa10079d601b1b92611f0d92166125f5565b611f179190612614565b611f219190612636565b6001830154909150611f3d9082906001600160801b03166127da565b6001830180546001600160801b0319166001600160801b03929092169190911790556001600160a01b0385166000908152609d6020526040902054611f8390829061254e565b6001600160a01b0386166000908152609d6020526040902055505b80546001600160801b0319166001600160801b0383161781556001600160a01b0384166000908152609b6020526040902054676765c793fa10079d601b1b90611fe790846125f5565b611ff19190612614565b81546001600160801b03918216600160801b029116179055505050565b600061201b858484611e17565b6001600160a01b03808616600090815260a0602090815260408083209388168352929052205461205790869086906001600160801b0316611e92565b6001600160a01b03858116600090815260a06020908152604080832093881683529290522060010180546001600160801b0380821692839290916010916120a7918591600160801b9004166127da565b82546101009290920a6001600160801b038181021990931691831602179091556001600160a01b03888116600081815260a060209081526040808320948c16835293815283822060010180546001600160801b0319169055918152609c909152205461211792509083169061254e565b6001600160a01b0387166000908152609c60205260409020556001600160801b03169050949350505050565b6121506202a30082612614565b6001600160a01b039092166000908152609f602052604090209190915550565b6060831561217f5750816121a9565b82511561218f5782518084602001fd5b8160405162461bcd60e51b81526004016107779190612805565b9392505050565b6000602082840312156121c257600080fd5b5035919050565b6001600160a01b03811681146107fd57600080fd5b80356121e9816121c9565b919050565b60006020828403121561220057600080fd5b81356121a9816121c9565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156122495761224961220b565b604052919050565b6000806040838503121561226457600080fd5b82356001600160401b038082111561227b57600080fd5b818501915085601f83011261228f57600080fd5b81356020828211156122a3576122a361220b565b8160051b92506122b4818401612221565b82815292840181019281810190898511156122ce57600080fd5b948201945b848610156122f857853593506122e8846121c9565b83825294820194908201906122d3565b965061230790508782016121de565b9450505050509250929050565b6000806040838503121561232757600080fd5b8235612332816121c9565b91506020830135612342816121c9565b809150509250929050565b6000806000806080858703121561236357600080fd5b843561236e816121c9565b93506020850135925060408501359150606085013561238c816121c9565b939692955090935050565b600080604083850312156123aa57600080fd5b82356123b5816121c9565b946020939093013593505050565b6001600160a01b0391909116815260200190565b600080604083850312156123ea57600080fd5b82356123f5816121c9565b91506020838101356001600160401b038082111561241257600080fd5b818601915086601f83011261242657600080fd5b8135818111156124385761243861220b565b61244a601f8201601f19168501612221565b9150808252878482850101111561246057600080fd5b80848401858401376000848284010152508093505050509250929050565b60008060006040848603121561249357600080fd5b833561249e816121c9565b925060208401356001600160401b03808211156124ba57600080fd5b818601915086601f8301126124ce57600080fd5b8135818111156124dd57600080fd5b8760208260051b85010111156124f257600080fd5b6020830194508093505050509250925092565b60006020828403121561251757600080fd5b81516121a9816121c9565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000821982111561256157612561612538565b500190565b600060001982141561257a5761257a612538565b5060010190565b6020808252602c9082015260008051602061283983398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c9082015260008051602061283983398151915260408201526b6163746976652070726f787960a01b606082015260800190565b600081600019048311821515161561260f5761260f612538565b500290565b60008261263157634e487b7160e01b600052601260045260246000fd5b500490565b60008282101561264857612648612538565b500390565b6020808252600c908201526b232aa7222fa6a0a720a3a2a960a11b604082015260600190565b80516001600160401b03811681146121e957600080fd5b805180151581146121e957600080fd5b600080600080608085870312156126b057600080fd5b845163ffffffff811681146126c457600080fd5b93506126d260208601612673565b92506126e060408601612673565b91506126ee6060860161268a565b905092959194509250565b60006020828403121561270b57600080fd5b6121a98261268a565b6001600160a01b038481168252606060208084018290528551918401829052600092868201929091906080860190855b81811015612762578551851683529483019491830191600101612744565b505080945050505050826040830152949350505050565b60006020828403121561278b57600080fd5b5051919050565b60005b838110156127ad578181015183820152602001612795565b8381111561168d5750506000910152565b600082516127d0818460208701612792565b9190910192915050565b60006001600160801b038281168482168083038211156127fc576127fc612538565b01949350505050565b6020815260008251806020840152612824816040850160208701612792565b601f01601f1916919091016040019291505056fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a2646970667358221220366ca391e1d79726fda5540b911ff2ca0d114f527575faa5acc41ebef433b7e564736f6c63430008080033";var deployedBytecode="0x6080604052600436106101265760003560e01c806305a6aafa1461012b5780631b3c90a81461014d578063213b329e1461016257806322dec37b146101875780632d36bd88146101b45780632e42a896146101e957806331903da11461027b5780633659cfe6146102a85780633c8c043a146102c85780633d9a12cc146102de5780633e458a8e146102fe5780633e6326fc1461031e5780634162169f1461034b57806347b3e7e81461036b5780634f1db7f6146103985780634f1ef286146103f657806352e62ac2146104095780635aef7de6146104295780637bcbb9ff14610449578063846141b31461047f578063862a4d47146104ac5780638aaa31de146104c2578063a39b2153146104e2578063c4d66de814610502578063e1758bd814610522575b600080fd5b34801561013757600080fd5b5061014b6101463660046121b0565b610537565b005b34801561015957600080fd5b5061014b610544565b34801561016e57600080fd5b506202a3005b6040519081526020015b60405180910390f35b34801561019357600080fd5b506101746101a23660046121ee565b609c6020526000908152604090205481565b3480156101c057600080fd5b506101d46101cf366004612251565b610689565b6040805192835260208301919091520161017e565b3480156101f557600080fd5b50610248610204366004612314565b60a0602090815260009283526040808420909152908252902080546001909101546001600160801b0380831692600160801b90819004821692808316929190041684565b604080516001600160801b039586168152938516602085015291841691830191909152909116606082015260800161017e565b34801561028757600080fd5b506101746102963660046121ee565b609d6020526000908152604090205481565b3480156102b457600080fd5b5061014b6102c33660046121ee565b61072e565b3480156102d457600080fd5b5061017460d35481565b3480156102ea57600080fd5b506101746102f936600461234d565b610800565b34801561030a57600080fd5b5061014b610319366004612397565b6108f4565b34801561032a57600080fd5b5060675461033e906001600160a01b031681565b60405161017e91906123c3565b34801561035757600080fd5b5060655461033e906001600160a01b031681565b34801561037757600080fd5b506101746103863660046121ee565b609f6020526000908152604090205481565b3480156103a457600080fd5b506101d46103b3366004612314565b6001600160a01b03918216600081815260a06020908152604080832094909516825292835283812054918152609a909252919020546001600160801b0390911691565b61014b6104043660046123d7565b610a9c565b34801561041557600080fd5b50610174610424366004612251565b610b56565b34801561043557600080fd5b5060665461033e906001600160a01b031681565b34801561045557600080fd5b506101746104643660046121ee565b6001600160a01b03166000908152609b602052604090205490565b34801561048b57600080fd5b5061017461049a3660046121ee565b609e6020526000908152604090205481565b3480156104b857600080fd5b5061017460d45481565b3480156104ce57600080fd5b5061014b6104dd36600461247e565b610ceb565b3480156104ee57600080fd5b5061014b6104fd366004612397565b610d2d565b34801561050e57600080fd5b5061014b61051d3660046121ee565b610e63565b34801561052e57600080fd5b5061033e610f2d565b61053f610fc9565b60d355565b60675460405163bf40fac160e01b815260206004820152600a60248201526921a7a72a2927a62622a960b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b1580156105a257600080fd5b505afa1580156105b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105da9190612505565b606580546001600160a01b0319166001600160a01b0392909216918217905560408051632d77bef360e11b81529051635aef7de691600480820192602092909190829003018186803b15801561062f57600080fd5b505afa158015610643573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106679190612505565b606680546001600160a01b0319166001600160a01b0392909216919091179055565b60008060006106988585610b56565b90506000805b86518110156107235760a060008883815181106106bd576106bd612522565b6020908102919091018101516001600160a01b0390811683528282019390935260409182016000908120938a16815292905290206001015461070f90600160801b90046001600160801b03168361254e565b91508061071b81612566565b91505061069e565b509590945092505050565b306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156107805760405162461bcd60e51b815260040161077790612581565b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166107b261109d565b6001600160a01b0316146107d85760405162461bcd60e51b8152600401610777906125bb565b6107e1816110b9565b604080516000808252602082019092526107fd918391906110c1565b50565b6001600160a01b03808516600081815260a0602090815260408083209486168352938152838220845160808101865281546001600160801b038082168352600160801b9182900481168386015260019093015480841683890152049091166060820152928252609a9052918220548290156108ea576000610882888888611208565b91505082604001516001600160801b0316915082602001516001600160801b0316676765c793fa10079d601b1b8285600001516001600160801b03166108c891906125f5565b6108d29190612614565b6108dc9190612636565b6108e6908361254e565b9150505b9695505050505050565b60675460405163bf40fac160e01b81523391600091829182916001600160a01b039091169063bf40fac19061092b9060040161264d565b60206040518083038186803b15801561094357600080fd5b505afa158015610957573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061097b9190612505565b6001600160a01b031663d0250144856040518263ffffffff1660e01b81526004016109a691906123c3565b60806040518083038186803b1580156109be57600080fd5b505afa1580156109d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109f6919061269a565b935093509350508015610a0b57505050505050565b610a2a848787866001600160401b0316866001600160401b0316611300565b50604080516001808252818301909252600091602080830190803683370190505090508481600081518110610a6157610a61612522565b60200260200101906001600160a01b031690816001600160a01b031681525050610a8b878261139d565b610a93611693565b50505050505050565b306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610ae55760405162461bcd60e51b815260040161077790612581565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316610b1761109d565b6001600160a01b031614610b3d5760405162461bcd60e51b8152600401610777906125bb565b610b46826110b9565b610b52828260016110c1565b5050565b60008060005b8451811015610ce35760675460405163bf40fac160e01b8152600091829182916001600160a01b03169063bf40fac190610b989060040161264d565b60206040518083038186803b158015610bb057600080fd5b505afa158015610bc4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610be89190612505565b6001600160a01b031663d0250144898681518110610c0857610c08612522565b60200260200101516040518263ffffffff1660e01b8152600401610c2c91906123c3565b60806040518083038186803b158015610c4457600080fd5b505afa158015610c58573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c7c919061269a565b919550935091505080610ccd57610cc0888581518110610c9e57610c9e612522565b6020026020010151846001600160401b0316846001600160401b03168a610800565b610cca908661254e565b94505b5050508080610cdb90612566565b915050610b5c565b509392505050565b610d288383838080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525061139d92505050565b505050565b60675460405163bf40fac160e01b81523391600091829182916001600160a01b039091169063bf40fac190610d649060040161264d565b60206040518083038186803b158015610d7c57600080fd5b505afa158015610d90573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610db49190612505565b6001600160a01b031663d0250144856040518263ffffffff1660e01b8152600401610ddf91906123c3565b60806040518083038186803b158015610df757600080fd5b505afa158015610e0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2f919061269a565b935093509350508015610e4457505050505050565b610a2a848787866001600160401b0316866001600160401b0316611bc3565b600054610100900460ff1680610e7c575060005460ff16155b610edf5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610777565b600054610100900460ff16158015610f01576000805461ffff19166101011790555b66d3c21bcecceda160191b60d355610f1882611c36565b8015610b52576000805461ff00191690555050565b60675460405163bf40fac160e01b815260206004820152600a60248201526923a7a7a22227a62620a960b11b60448201526000916001600160a01b03169063bf40fac19060640160206040518083038186803b158015610f8c57600080fd5b505afa158015610fa0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fc49190612505565b905090565b60655460408051632d77bef360e11b8152905133926001600160a01b031691635aef7de6916004808301926020929190829003018186803b15801561100d57600080fd5b505afa158015611021573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110459190612505565b6001600160a01b03161461109b5760405162461bcd60e51b815260206004820181905260248201527f6f6e6c79206176617461722063616e2063616c6c2074686973206d6574686f646044820152606401610777565b565b600080516020612859833981519152546001600160a01b031690565b6107fd610fc9565b60006110cb61109d565b90506110d684611c59565b6000835111806110e35750815b156110f4576110f28484611cec565b505b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143805460ff1661120157805460ff1916600117815560405161116f9086906111409085906024016123c3565b60408051601f198184030181529190526020810180516001600160e01b0316631b2ce7f360e11b179052611cec565b50805460ff1916815561118061109d565b6001600160a01b0316826001600160a01b0316146111f85760405162461bcd60e51b815260206004820152602f60248201527f45524331393637557067726164653a207570677261646520627265616b73206660448201526e75727468657220757067726164657360881b6064820152608401610777565b61120185611dd7565b5050505050565b6001600160a01b0383166000908152609b6020908152604080832054609e9092529091205490838210801561123d5750834310155b6112475781611249565b835b9150600083431161125a574361125c565b835b90508481108061126c5750838310155b1561127757506112f8565b60006112838483612636565b6001600160a01b0388166000908152609f6020526040812054919250906112aa90836125f5565b6001600160a01b0389166000908152609a60205260409020549091506112db82676765c793fa10079d601b1b6125f5565b6112e59190612614565b6112ef908561254e565b93508294505050505b935093915050565b600061130d868484611e17565b6001600160a01b03808716600090815260a06020908152604080832093891683529290522054611354908790879061134f9088906001600160801b0316612636565b611e92565b6001600160a01b0386166000908152609a6020526040902054611378908590612636565b6001600160a01b0387166000908152609a602052604090205550600195945050505050565b60675460405163bf40fac160e01b815260009182916001600160a01b039091169063bf40fac1906113d09060040161264d565b60206040518083038186803b1580156113e857600080fd5b505afa1580156113fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114209190612505565b905060005b835181101561152f576000806000846001600160a01b031663d025014488868151811061145457611454612522565b60200260200101516040518263ffffffff1660e01b815260040161147891906123c3565b60806040518083038186803b15801561149057600080fd5b505afa1580156114a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114c8919061269a565b9195509350915050806115195761150c8785815181106114ea576114ea612522565b602002602001015189856001600160401b0316856001600160401b031661200e565b611516908761254e565b95505b505050808061152790612566565b915050611425565b50811561168d5760675460405163bf40fac160e01b815260206004820152600a6024820152692922a82aaa20aa24a7a760b11b60448201526001600160a01b039091169063bf40fac19060640160206040518083038186803b15801561159457600080fd5b505afa1580156115a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115cc9190612505565b6040516340c10f1960e01b81526001600160a01b0386811660048301526024820185905291909116906340c10f1990604401602060405180830381600087803b15801561161857600080fd5b505af115801561162c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061165091906126f9565b507fb5bb6cf2a7d73ab2167d87f348feea953c3e405a4ece2a262cd92cdce829f6d284848460405161168493929190612714565b60405180910390a15b50505050565b60675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac1906116c29060040161264d565b60206040518083038186803b1580156116da57600080fd5b505afa1580156116ee573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117129190612505565b6001600160a01b03161461109b5760675460405163bf40fac160e01b81526000916001600160a01b03169063bf40fac19061174f9060040161264d565b60206040518083038186803b15801561176757600080fd5b505afa15801561177b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061179f9190612505565b90506000816001600160a01b0316630e47dbd96040518163ffffffff1660e01b815260040160206040518083038186803b1580156117dc57600080fd5b505afa1580156117f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118149190612779565b90506000816001600160401b038111156118305761183061220b565b604051908082528060200260200182016040528015611859578160200160208202803683370190505b5090506000826001600160401b038111156118765761187661220b565b60405190808252806020026020018201604052801561189f578160200160208202803683370190505b5090506000805b84811015611b07576040516372d00e9f60e01b8152600481018290526001600160a01b038716906372d00e9f9060240160206040518083038186803b1580156118ee57600080fd5b505afa158015611902573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119269190612505565b84828151811061193857611938612522565b60200260200101906001600160a01b031690816001600160a01b031681525050600080876001600160a01b031663d025014487858151811061197c5761197c612522565b60200260200101516040518263ffffffff1660e01b81526004016119a091906123c3565b60806040518083038186803b1580156119b857600080fd5b505afa1580156119cc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119f0919061269a565b50925092505043826001600160401b031611158015611a17575043816001600160401b0316115b15611af2576000868481518110611a3057611a30612522565b60200260200101516001600160a01b031663e99b5d3d6040518163ffffffff1660e01b815260040160206040518083038186803b158015611a7057600080fd5b505afa158015611a84573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa89190612779565b905080868581518110611abd57611abd612522565b602002602001018181525050858481518110611adb57611adb612522565b602002602001015185611aee919061254e565b9450505b50508080611aff90612566565b9150506118a6565b5060005b84811015611bbb576000808311611b2f578560d354611b2a9190612614565b611b61565b82848381518110611b4257611b42612522565b602002602001015160d354611b5791906125f5565b611b619190612614565b90506000848381518110611b7757611b77612522565b60200260200101511115611ba857611ba8858381518110611b9a57611b9a612522565b602002602001015182612143565b5080611bb381612566565b915050611b0b565b505050505050565b6000611bd0868484611e17565b6001600160a01b03808716600090815260a06020908152604080832093891683529290522054611c12908790879061134f9088906001600160801b031661254e565b6001600160a01b0386166000908152609a602052604090205461137890859061254e565b606780546001600160a01b0319166001600160a01b0383161790556107fd610544565b803b611cbd5760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401610777565b60008051602061285983398151915280546001600160a01b0319166001600160a01b0392909216919091179055565b6060823b611d4b5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401610777565b600080846001600160a01b031684604051611d6691906127be565b600060405180830381855af49150503d8060008114611da1576040519150601f19603f3d011682016040523d82523d6000602084013e611da6565b606091505b5091509150611dce828260405180606001604052806027815260200161287960279139612170565b95945050505050565b611de081611c59565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b6001600160a01b0383166000908152609a6020526040902054611e525750506001600160a01b03166000908152609e60205260409020439055565b600080611e60858585611208565b6001600160a01b039096166000908152609b6020908152604080832098909855609e9052959095209490945550505050565b6001600160a01b03808416600090815260a06020908152604080832093861683529290522080546001600160801b031615611f9e5780546001600160a01b0385166000908152609b602052604081205490916001600160801b03600160801b8204811692676765c793fa10079d601b1b92611f0d92166125f5565b611f179190612614565b611f219190612636565b6001830154909150611f3d9082906001600160801b03166127da565b6001830180546001600160801b0319166001600160801b03929092169190911790556001600160a01b0385166000908152609d6020526040902054611f8390829061254e565b6001600160a01b0386166000908152609d6020526040902055505b80546001600160801b0319166001600160801b0383161781556001600160a01b0384166000908152609b6020526040902054676765c793fa10079d601b1b90611fe790846125f5565b611ff19190612614565b81546001600160801b03918216600160801b029116179055505050565b600061201b858484611e17565b6001600160a01b03808616600090815260a0602090815260408083209388168352929052205461205790869086906001600160801b0316611e92565b6001600160a01b03858116600090815260a06020908152604080832093881683529290522060010180546001600160801b0380821692839290916010916120a7918591600160801b9004166127da565b82546101009290920a6001600160801b038181021990931691831602179091556001600160a01b03888116600081815260a060209081526040808320948c16835293815283822060010180546001600160801b0319169055918152609c909152205461211792509083169061254e565b6001600160a01b0387166000908152609c60205260409020556001600160801b03169050949350505050565b6121506202a30082612614565b6001600160a01b039092166000908152609f602052604090209190915550565b6060831561217f5750816121a9565b82511561218f5782518084602001fd5b8160405162461bcd60e51b81526004016107779190612805565b9392505050565b6000602082840312156121c257600080fd5b5035919050565b6001600160a01b03811681146107fd57600080fd5b80356121e9816121c9565b919050565b60006020828403121561220057600080fd5b81356121a9816121c9565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156122495761224961220b565b604052919050565b6000806040838503121561226457600080fd5b82356001600160401b038082111561227b57600080fd5b818501915085601f83011261228f57600080fd5b81356020828211156122a3576122a361220b565b8160051b92506122b4818401612221565b82815292840181019281810190898511156122ce57600080fd5b948201945b848610156122f857853593506122e8846121c9565b83825294820194908201906122d3565b965061230790508782016121de565b9450505050509250929050565b6000806040838503121561232757600080fd5b8235612332816121c9565b91506020830135612342816121c9565b809150509250929050565b6000806000806080858703121561236357600080fd5b843561236e816121c9565b93506020850135925060408501359150606085013561238c816121c9565b939692955090935050565b600080604083850312156123aa57600080fd5b82356123b5816121c9565b946020939093013593505050565b6001600160a01b0391909116815260200190565b600080604083850312156123ea57600080fd5b82356123f5816121c9565b91506020838101356001600160401b038082111561241257600080fd5b818601915086601f83011261242657600080fd5b8135818111156124385761243861220b565b61244a601f8201601f19168501612221565b9150808252878482850101111561246057600080fd5b80848401858401376000848284010152508093505050509250929050565b60008060006040848603121561249357600080fd5b833561249e816121c9565b925060208401356001600160401b03808211156124ba57600080fd5b818601915086601f8301126124ce57600080fd5b8135818111156124dd57600080fd5b8760208260051b85010111156124f257600080fd5b6020830194508093505050509250925092565b60006020828403121561251757600080fd5b81516121a9816121c9565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000821982111561256157612561612538565b500190565b600060001982141561257a5761257a612538565b5060010190565b6020808252602c9082015260008051602061283983398151915260408201526b19195b1959d85d1958d85b1b60a21b606082015260800190565b6020808252602c9082015260008051602061283983398151915260408201526b6163746976652070726f787960a01b606082015260800190565b600081600019048311821515161561260f5761260f612538565b500290565b60008261263157634e487b7160e01b600052601260045260246000fd5b500490565b60008282101561264857612648612538565b500390565b6020808252600c908201526b232aa7222fa6a0a720a3a2a960a11b604082015260600190565b80516001600160401b03811681146121e957600080fd5b805180151581146121e957600080fd5b600080600080608085870312156126b057600080fd5b845163ffffffff811681146126c457600080fd5b93506126d260208601612673565b92506126e060408601612673565b91506126ee6060860161268a565b905092959194509250565b60006020828403121561270b57600080fd5b6121a98261268a565b6001600160a01b038481168252606060208084018290528551918401829052600092868201929091906080860190855b81811015612762578551851683529483019491830191600101612744565b505080945050505050826040830152949350505050565b60006020828403121561278b57600080fd5b5051919050565b60005b838110156127ad578181015183820152602001612795565b8381111561168d5750506000910152565b600082516127d0818460208701612792565b9190910192915050565b60006001600160801b038281168482168083038211156127fc576127fc612538565b01949350505050565b6020815260008251806020840152612824816040850160208701612792565b601f01601f1916919091016040019291505056fe46756e6374696f6e206d7573742062652063616c6c6564207468726f75676820360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a2646970667358221220366ca391e1d79726fda5540b911ff2ca0d114f527575faa5acc41ebef433b7e564736f6c63430008080033";var linkReferences={};var deployedLinkReferences={};var StakersDistribution = {_format:_format,contractName:contractName,sourceName:sourceName,abi:abi$1,bytecode:bytecode,deployedBytecode:deployedBytecode,linkReferences:linkReferences,deployedLinkReferences:deployedLinkReferences};

/**
 * Returns instance of StakersDistribution contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
function stakersDistributionContract(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(address !== null && address !== void 0)) return [3 /*break*/, 1];
                    _a = address;
                    return [3 /*break*/, 3];
                case 1:
                    _b = G$ContractAddresses;
                    return [4 /*yield*/, getChainId(web3)];
                case 2:
                    _a = _b.apply(void 0, [_c.sent(), 'StakersDistribution']);
                    _c.label = 3;
                case 3:
                    address = _a;
                    return [2 /*return*/, new web3.eth.Contract(StakersDistribution.abi, address)];
            }
        });
    });
}

var CDAIAbi = [{inputs:[{internalType:"address",name:"underlying_",type:"address"},{internalType:"contract ComptrollerInterface",name:"comptroller_",type:"address"},{internalType:"contract InterestRateModel",name:"interestRateModel_",type:"address"},{internalType:"uint256",name:"initialExchangeRateMantissa_",type:"uint256"},{internalType:"string",name:"name_",type:"string"},{internalType:"string",name:"symbol_",type:"string"},{internalType:"uint8",name:"decimals_",type:"uint8"},{internalType:"address payable",name:"admin_",type:"address"},{internalType:"address",name:"implementation_",type:"address"},{internalType:"bytes",name:"becomeImplementationData",type:"bytes"}],payable:false,stateMutability:"nonpayable",type:"constructor",signature:"constructor"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"cashPrior",type:"uint256"},{indexed:false,internalType:"uint256",name:"interestAccumulated",type:"uint256"},{indexed:false,internalType:"uint256",name:"borrowIndex",type:"uint256"},{indexed:false,internalType:"uint256",name:"totalBorrows",type:"uint256"}],name:"AccrueInterest",type:"event",signature:"0x4dec04e750ca11537cabcd8a9eab06494de08da3735bc8871cd41250e190bc04"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"owner",type:"address"},{indexed:true,internalType:"address",name:"spender",type:"address"},{indexed:false,internalType:"uint256",name:"amount",type:"uint256"}],name:"Approval",type:"event",signature:"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"borrower",type:"address"},{indexed:false,internalType:"uint256",name:"borrowAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"accountBorrows",type:"uint256"},{indexed:false,internalType:"uint256",name:"totalBorrows",type:"uint256"}],name:"Borrow",type:"event",signature:"0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"error",type:"uint256"},{indexed:false,internalType:"uint256",name:"info",type:"uint256"},{indexed:false,internalType:"uint256",name:"detail",type:"uint256"}],name:"Failure",type:"event",signature:"0x45b96fe442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa0"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"liquidator",type:"address"},{indexed:false,internalType:"address",name:"borrower",type:"address"},{indexed:false,internalType:"uint256",name:"repayAmount",type:"uint256"},{indexed:false,internalType:"address",name:"cTokenCollateral",type:"address"},{indexed:false,internalType:"uint256",name:"seizeTokens",type:"uint256"}],name:"LiquidateBorrow",type:"event",signature:"0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"minter",type:"address"},{indexed:false,internalType:"uint256",name:"mintAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"mintTokens",type:"uint256"}],name:"Mint",type:"event",signature:"0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"oldAdmin",type:"address"},{indexed:false,internalType:"address",name:"newAdmin",type:"address"}],name:"NewAdmin",type:"event",signature:"0xf9ffabca9c8276e99321725bcb43fb076a6c66a54b7f21c4e8146d8519b417dc"},{anonymous:false,inputs:[{indexed:false,internalType:"contract ComptrollerInterface",name:"oldComptroller",type:"address"},{indexed:false,internalType:"contract ComptrollerInterface",name:"newComptroller",type:"address"}],name:"NewComptroller",type:"event",signature:"0x7ac369dbd14fa5ea3f473ed67cc9d598964a77501540ba6751eb0b3decf5870d"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"oldImplementation",type:"address"},{indexed:false,internalType:"address",name:"newImplementation",type:"address"}],name:"NewImplementation",type:"event",signature:"0xd604de94d45953f9138079ec1b82d533cb2160c906d1076d1f7ed54befbca97a"},{anonymous:false,inputs:[{indexed:false,internalType:"contract InterestRateModel",name:"oldInterestRateModel",type:"address"},{indexed:false,internalType:"contract InterestRateModel",name:"newInterestRateModel",type:"address"}],name:"NewMarketInterestRateModel",type:"event",signature:"0xedffc32e068c7c95dfd4bdfd5c4d939a084d6b11c4199eac8436ed234d72f926"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"oldPendingAdmin",type:"address"},{indexed:false,internalType:"address",name:"newPendingAdmin",type:"address"}],name:"NewPendingAdmin",type:"event",signature:"0xca4f2f25d0898edd99413412fb94012f9e54ec8142f9b093e7720646a95b16a9"},{anonymous:false,inputs:[{indexed:false,internalType:"uint256",name:"oldReserveFactorMantissa",type:"uint256"},{indexed:false,internalType:"uint256",name:"newReserveFactorMantissa",type:"uint256"}],name:"NewReserveFactor",type:"event",signature:"0xaaa68312e2ea9d50e16af5068410ab56e1a1fd06037b1a35664812c30f821460"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"redeemer",type:"address"},{indexed:false,internalType:"uint256",name:"redeemAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"redeemTokens",type:"uint256"}],name:"Redeem",type:"event",signature:"0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"payer",type:"address"},{indexed:false,internalType:"address",name:"borrower",type:"address"},{indexed:false,internalType:"uint256",name:"repayAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"accountBorrows",type:"uint256"},{indexed:false,internalType:"uint256",name:"totalBorrows",type:"uint256"}],name:"RepayBorrow",type:"event",signature:"0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"benefactor",type:"address"},{indexed:false,internalType:"uint256",name:"addAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"newTotalReserves",type:"uint256"}],name:"ReservesAdded",type:"event",signature:"0xa91e67c5ea634cd43a12c5a482724b03de01e85ca68702a53d0c2f45cb7c1dc5"},{anonymous:false,inputs:[{indexed:false,internalType:"address",name:"admin",type:"address"},{indexed:false,internalType:"uint256",name:"reduceAmount",type:"uint256"},{indexed:false,internalType:"uint256",name:"newTotalReserves",type:"uint256"}],name:"ReservesReduced",type:"event",signature:"0x3bad0c59cf2f06e7314077049f48a93578cd16f5ef92329f1dab1420a99c177e"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"amount",type:"uint256"}],name:"Transfer",type:"event",signature:"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"},{payable:true,stateMutability:"payable",type:"fallback"},{constant:false,inputs:[],name:"_acceptAdmin",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xe9c714f2"},{constant:false,inputs:[{internalType:"uint256",name:"addAmount",type:"uint256"}],name:"_addReserves",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x3e941010"},{constant:false,inputs:[{internalType:"uint256",name:"reduceAmount",type:"uint256"}],name:"_reduceReserves",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x601a0bf1"},{constant:false,inputs:[{internalType:"contract ComptrollerInterface",name:"newComptroller",type:"address"}],name:"_setComptroller",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x4576b5db"},{constant:false,inputs:[{internalType:"address",name:"implementation_",type:"address"},{internalType:"bool",name:"allowResign",type:"bool"},{internalType:"bytes",name:"becomeImplementationData",type:"bytes"}],name:"_setImplementation",outputs:[],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x555bcc40"},{constant:false,inputs:[{internalType:"contract InterestRateModel",name:"newInterestRateModel",type:"address"}],name:"_setInterestRateModel",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xf2b3abbd"},{constant:false,inputs:[{internalType:"address payable",name:"newPendingAdmin",type:"address"}],name:"_setPendingAdmin",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xb71d1a0c"},{constant:false,inputs:[{internalType:"uint256",name:"newReserveFactorMantissa",type:"uint256"}],name:"_setReserveFactor",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xfca7820b"},{constant:true,inputs:[],name:"accrualBlockNumber",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x6c540baf"},{constant:false,inputs:[],name:"accrueInterest",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xa6afed95"},{constant:true,inputs:[],name:"admin",outputs:[{internalType:"address payable",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0xf851a440"},{constant:true,inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0xdd62ed3e"},{constant:false,inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x095ea7b3"},{constant:true,inputs:[{internalType:"address",name:"owner",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x70a08231"},{constant:false,inputs:[{internalType:"address",name:"owner",type:"address"}],name:"balanceOfUnderlying",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x3af9e669"},{constant:false,inputs:[{internalType:"uint256",name:"borrowAmount",type:"uint256"}],name:"borrow",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xc5ebeaec"},{constant:false,inputs:[{internalType:"address",name:"account",type:"address"}],name:"borrowBalanceCurrent",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x17bfdfbc"},{constant:true,inputs:[{internalType:"address",name:"account",type:"address"}],name:"borrowBalanceStored",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x95dd9193"},{constant:true,inputs:[],name:"borrowIndex",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0xaa5af0fd"},{constant:true,inputs:[],name:"borrowRatePerBlock",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0xf8f9da28"},{constant:true,inputs:[],name:"comptroller",outputs:[{internalType:"contract ComptrollerInterface",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0x5fe3b567"},{constant:true,inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],payable:false,stateMutability:"view",type:"function",signature:"0x313ce567"},{constant:false,inputs:[{internalType:"bytes",name:"data",type:"bytes"}],name:"delegateToImplementation",outputs:[{internalType:"bytes",name:"",type:"bytes"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x0933c1ed"},{constant:true,inputs:[{internalType:"bytes",name:"data",type:"bytes"}],name:"delegateToViewImplementation",outputs:[{internalType:"bytes",name:"",type:"bytes"}],payable:false,stateMutability:"view",type:"function",signature:"0x4487152f"},{constant:false,inputs:[],name:"exchangeRateCurrent",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xbd6d894d"},{constant:true,inputs:[],name:"exchangeRateStored",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x182df0f5"},{constant:true,inputs:[{internalType:"address",name:"account",type:"address"}],name:"getAccountSnapshot",outputs:[{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"},{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0xc37f68e2"},{constant:true,inputs:[],name:"getCash",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x3b1d21a2"},{constant:true,inputs:[],name:"implementation",outputs:[{internalType:"address",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0x5c60da1b"},{constant:true,inputs:[],name:"interestRateModel",outputs:[{internalType:"contract InterestRateModel",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0xf3fdb15a"},{constant:true,inputs:[],name:"isCToken",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"view",type:"function",signature:"0xfe9c44ae"},{constant:false,inputs:[{internalType:"address",name:"borrower",type:"address"},{internalType:"uint256",name:"repayAmount",type:"uint256"},{internalType:"contract CTokenInterface",name:"cTokenCollateral",type:"address"}],name:"liquidateBorrow",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xf5e3c462"},{constant:false,inputs:[{internalType:"uint256",name:"mintAmount",type:"uint256"}],name:"mint",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xa0712d68"},{constant:true,inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],payable:false,stateMutability:"view",type:"function",signature:"0x06fdde03"},{constant:true,inputs:[],name:"pendingAdmin",outputs:[{internalType:"address payable",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0x26782247"},{constant:false,inputs:[{internalType:"uint256",name:"redeemTokens",type:"uint256"}],name:"redeem",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xdb006a75"},{constant:false,inputs:[{internalType:"uint256",name:"redeemAmount",type:"uint256"}],name:"redeemUnderlying",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x852a12e3"},{constant:false,inputs:[{internalType:"uint256",name:"repayAmount",type:"uint256"}],name:"repayBorrow",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x0e752702"},{constant:false,inputs:[{internalType:"address",name:"borrower",type:"address"},{internalType:"uint256",name:"repayAmount",type:"uint256"}],name:"repayBorrowBehalf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x2608f818"},{constant:true,inputs:[],name:"reserveFactorMantissa",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x173b9904"},{constant:false,inputs:[{internalType:"address",name:"liquidator",type:"address"},{internalType:"address",name:"borrower",type:"address"},{internalType:"uint256",name:"seizeTokens",type:"uint256"}],name:"seize",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xb2a02ff1"},{constant:true,inputs:[],name:"supplyRatePerBlock",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0xae9d70b0"},{constant:true,inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],payable:false,stateMutability:"view",type:"function",signature:"0x95d89b41"},{constant:true,inputs:[],name:"totalBorrows",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x47bd3718"},{constant:false,inputs:[],name:"totalBorrowsCurrent",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x73acee98"},{constant:true,inputs:[],name:"totalReserves",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x8f840ddd"},{constant:true,inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function",signature:"0x18160ddd"},{constant:false,inputs:[{internalType:"address",name:"dst",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0xa9059cbb"},{constant:false,inputs:[{internalType:"address",name:"src",type:"address"},{internalType:"address",name:"dst",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function",signature:"0x23b872dd"},{constant:true,inputs:[],name:"underlying",outputs:[{internalType:"address",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function",signature:"0x6f307dc3"}];

/**
 * Returns instance of compound contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
function compoundContract(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new web3.eth.Contract(CDAIAbi, address)];
        });
    });
}

/**
 * Calculates compound -> underlying ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @param {string} address Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
var compoundPrice = memoize_1(function (web3, address) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, contract, token, denominator, value;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    compoundContract(web3, address),
                    getTokenByAddress(web3, address)
                ])];
            case 1:
                _a = __read.apply(void 0, [_b.sent(), 2]), contract = _a[0], token = _a[1];
                denominator = 1e28;
                if (token.symbol === 'cUSDC' || token.symbol === 'cUSDT') {
                    denominator = 1e16;
                }
                else if (token.symbol === 'cWBTC') {
                    denominator = 1e18;
                }
                return [4 /*yield*/, contract.methods.exchangeRateCurrent().call()];
            case 2:
                value = _b.sent();
                delayedCacheClear(compoundPrice);
                return [2 /*return*/, new Fraction(value, denominator)];
        }
    });
}); }, function (_, __, chainId) { return chainId; });

var _a, _b, _c, _d, _e, _f, _g;
/* List of all mirror's assets addresses. Pulled from: https://whitelist.mirror.finance/eth/tokenlists.json */
var mAssetsAdditionalBases = (_a = {},
    _a[UST.address] = [MIR],
    _a[MIR.address] = [UST],
    _a['0xd36932143F6eBDEDD872D5Fb0651f4B72Fd15a84'] = [MIR, UST],
    _a['0x59A921Db27Dd6d4d974745B7FfC5c33932653442'] = [MIR, UST],
    _a['0x21cA39943E91d704678F5D00b6616650F066fD63'] = [MIR, UST],
    _a['0xC8d674114bac90148d11D3C1d33C61835a0F9DCD'] = [MIR, UST],
    _a['0x13B02c8dE71680e71F0820c996E4bE43c2F57d15'] = [MIR, UST],
    _a['0xEdb0414627E6f1e3F082DE65cD4F9C693D78CCA9'] = [MIR, UST],
    _a['0x41BbEDd7286dAab5910a1f15d12CBda839852BD7'] = [MIR, UST],
    _a['0x0cae9e4d663793c2a2A0b211c1Cf4bBca2B9cAa7'] = [MIR, UST],
    _a['0x56aA298a19C93c6801FDde870fA63EF75Cc0aF72'] = [MIR, UST],
    _a['0x1d350417d9787E000cc1b95d70E9536DcD91F373'] = [MIR, UST],
    _a['0x9d1555d8cB3C846Bb4f7D5B1B1080872c3166676'] = [MIR, UST],
    _a['0x31c63146a635EB7465e5853020b39713AC356991'] = [MIR, UST],
    _a['0xf72FCd9DCF0190923Fadd44811E240Ef4533fc86'] = [MIR, UST],
    _a);
var WETH_ONLY = (_b = {},
    _b[SupportedChainId.MAINNET] = [WETH9_EXTENDED[SupportedChainId.MAINNET]],
    _b[SupportedChainId.KOVAN] = [WETH9_EXTENDED[SupportedChainId.KOVAN]],
    _b[SupportedChainId.FUSE] = [WETH9_EXTENDED[SupportedChainId.FUSE]],
    _b);
/* Used to construct intermediary pairs for trading. */
var BASES_TO_CHECK_TRADES_AGAINST = __assign(__assign({}, WETH_ONLY), (_c = {}, _c[SupportedChainId.MAINNET] = __spreadArray(__spreadArray([], __read(WETH_ONLY[SupportedChainId.MAINNET]), false), [DAI[SupportedChainId.MAINNET], USDC[SupportedChainId.MAINNET], USDT, WBTC[SupportedChainId.MAINNET]], false), _c[SupportedChainId.KOVAN] = __spreadArray(__spreadArray([], __read(WETH_ONLY[SupportedChainId.KOVAN]), false), [DAI[SupportedChainId.KOVAN], USDC[SupportedChainId.KOVAN], WBTC[SupportedChainId.KOVAN]], false), _c[SupportedChainId.FUSE] = __spreadArray(__spreadArray([], __read(WETH_ONLY[SupportedChainId.FUSE]), false), [DAI[SupportedChainId.FUSE], USDC[SupportedChainId.FUSE]], false), _c));
/* Additional swap bases. */
var ADDITIONAL_BASES = (_d = {},
    _d[SupportedChainId.MAINNET] = __assign(__assign({}, mAssetsAdditionalBases), (_e = { '0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0': [ETH2X_FLI], '0xA948E86885e12Fb09AfEF8C52142EBDbDf73cD18': [UNI[1]], '0x561a4717537ff4AF5c687328c0f7E90a319705C0': [UNI[1]], '0xE0360A9e2cdd7d03B9408c7D3001E017BAc2EcD5': [UNI[1]], '0xa6e3454fec677772dd771788a079355e43910638': [UMA], '0xB46F57e7Ce3a284d74b70447Ef9352B5E5Df8963': [UMA] }, _e[FEI.address] = [TRIBE], _e[TRIBE.address] = [FEI], _e[FRAX.address] = [FXS], _e[FXS.address] = [FRAX], _e[WBTC[SupportedChainId.MAINNET].address] = [renBTC], _e[renBTC.address] = [WBTC[SupportedChainId.MAINNET]], _e)),
    _d);
/* Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens. */
var CUSTOM_BASES = (_f = {},
    _f[SupportedChainId.MAINNET] = (_g = {},
        _g[AMPL.address] = [DAI[SupportedChainId.MAINNET], WETH9_EXTENDED[SupportedChainId.MAINNET]],
        _g),
    _f);

/**
 * Calculates all currency combinations in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @returns {Promise<Array<[Currency, Currency]>>} List of pairs.
 */
var allCurrencyCombinations = memoize_1(function (chainId, currencyA, currencyB) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tokenA, tokenB, bases, common, additionalA, additionalB, _b, fuseTokens, basePairs;
    var _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _a = __read(chainId ? [currencyA === null || currencyA === void 0 ? void 0 : currencyA.wrapped, currencyB === null || currencyB === void 0 ? void 0 : currencyB.wrapped] : [undefined, undefined], 2), tokenA = _a[0], tokenB = _a[1];
                bases = [];
                if (chainId) {
                    common = (_c = BASES_TO_CHECK_TRADES_AGAINST[chainId]) !== null && _c !== void 0 ? _c : [];
                    additionalA = tokenA ? (_e = (_d = ADDITIONAL_BASES[chainId]) === null || _d === void 0 ? void 0 : _d[tokenA.address]) !== null && _e !== void 0 ? _e : [] : [];
                    additionalB = tokenB ? (_g = (_f = ADDITIONAL_BASES[chainId]) === null || _f === void 0 ? void 0 : _f[tokenB.address]) !== null && _g !== void 0 ? _g : [] : [];
                    bases = __spreadArray(__spreadArray(__spreadArray([], __read(common), false), __read(additionalA), false), __read(additionalB), false);
                }
                if (!(chainId === SupportedChainId.FUSE)) return [3 /*break*/, 2];
                return [4 /*yield*/, getTokens(SupportedChainId.FUSE)];
            case 1:
                _b = __read.apply(void 0, [_h.sent(), 1]), fuseTokens = _b[0];
                bases = __spreadArray(__spreadArray([], __read(bases), false), __read(Array.from(fuseTokens.values())), false);
                _h.label = 2;
            case 2:
                basePairs = flatMap_1(bases, function (base) {
                    return bases.map(function (otherBase) { return [base, otherBase]; });
                });
                return [2 /*return*/, tokenA && tokenB
                        ? __spreadArray(__spreadArray(__spreadArray([
                            // the direct pair
                            [tokenA, tokenB]
                        ], __read(bases.map(function (base) { return [tokenA, base]; })), false), __read(bases.map(function (base) { return [tokenB, base]; })), false), __read(basePairs), false).filter(function (tokens) { return Boolean(tokens[0] && tokens[1]); })
                            .filter(function (_a) {
                            var _b = __read(_a, 2), t0 = _b[0], t1 = _b[1];
                            return t0.address !== t1.address;
                        })
                            .filter(function (_a) {
                            var _b = __read(_a, 2), tokenA = _b[0], tokenB = _b[1];
                            if (!chainId)
                                return true;
                            var customBases = CUSTOM_BASES[chainId];
                            var customBasesA = customBases === null || customBases === void 0 ? void 0 : customBases[tokenA.address];
                            var customBasesB = customBases === null || customBases === void 0 ? void 0 : customBases[tokenB.address];
                            if (!customBasesA && !customBasesB)
                                return true;
                            if (customBasesA && !customBasesA.find(function (base) { return tokenB.equals(base); }))
                                return false;
                            return !(customBasesB && !customBasesB.find(function (base) { return tokenA.equals(base); }));
                        })
                        : []];
        }
    });
}); }, function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args[0] + args[1].symbol + args[2].symbol;
});

var abi=[{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"owner",type:"address"},{indexed:true,internalType:"address",name:"spender",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"sender",type:"address"},{indexed:false,internalType:"uint256",name:"amount0",type:"uint256"},{indexed:false,internalType:"uint256",name:"amount1",type:"uint256"},{indexed:true,internalType:"address",name:"to",type:"address"}],name:"Burn",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"sender",type:"address"},{indexed:false,internalType:"uint256",name:"amount0",type:"uint256"},{indexed:false,internalType:"uint256",name:"amount1",type:"uint256"}],name:"Mint",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"sender",type:"address"},{indexed:false,internalType:"uint256",name:"amount0In",type:"uint256"},{indexed:false,internalType:"uint256",name:"amount1In",type:"uint256"},{indexed:false,internalType:"uint256",name:"amount0Out",type:"uint256"},{indexed:false,internalType:"uint256",name:"amount1Out",type:"uint256"},{indexed:true,internalType:"address",name:"to",type:"address"}],name:"Swap",type:"event"},{anonymous:false,inputs:[{indexed:false,internalType:"uint112",name:"reserve0",type:"uint112"},{indexed:false,internalType:"uint112",name:"reserve1",type:"uint112"}],name:"Sync",type:"event"},{anonymous:false,inputs:[{indexed:true,internalType:"address",name:"from",type:"address"},{indexed:true,internalType:"address",name:"to",type:"address"},{indexed:false,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{constant:true,inputs:[],name:"DOMAIN_SEPARATOR",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"MINIMUM_LIQUIDITY",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"pure",type:"function"},{constant:true,inputs:[],name:"PERMIT_TYPEHASH",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],payable:false,stateMutability:"pure",type:"function"},{constant:true,inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"value",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[{internalType:"address",name:"owner",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"to",type:"address"}],name:"burn",outputs:[{internalType:"uint256",name:"amount0",type:"uint256"},{internalType:"uint256",name:"amount1",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],payable:false,stateMutability:"pure",type:"function"},{constant:true,inputs:[],name:"factory",outputs:[{internalType:"address",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"getReserves",outputs:[{internalType:"uint112",name:"reserve0",type:"uint112"},{internalType:"uint112",name:"reserve1",type:"uint112"},{internalType:"uint32",name:"blockTimestampLast",type:"uint32"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"",type:"address"},{internalType:"address",name:"",type:"address"}],name:"initialize",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"kLast",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"to",type:"address"}],name:"mint",outputs:[{internalType:"uint256",name:"liquidity",type:"uint256"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],payable:false,stateMutability:"pure",type:"function"},{constant:true,inputs:[{internalType:"address",name:"owner",type:"address"}],name:"nonces",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"value",type:"uint256"},{internalType:"uint256",name:"deadline",type:"uint256"},{internalType:"uint8",name:"v",type:"uint8"},{internalType:"bytes32",name:"r",type:"bytes32"},{internalType:"bytes32",name:"s",type:"bytes32"}],name:"permit",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"price0CumulativeLast",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"price1CumulativeLast",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"to",type:"address"}],name:"skim",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{internalType:"uint256",name:"amount0Out",type:"uint256"},{internalType:"uint256",name:"amount1Out",type:"uint256"},{internalType:"address",name:"to",type:"address"},{internalType:"bytes",name:"data",type:"bytes"}],name:"swap",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],payable:false,stateMutability:"pure",type:"function"},{constant:false,inputs:[],name:"sync",outputs:[],payable:false,stateMutability:"nonpayable",type:"function"},{constant:true,inputs:[],name:"token0",outputs:[{internalType:"address",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"token1",outputs:[{internalType:"address",name:"",type:"address"}],payable:false,stateMutability:"view",type:"function"},{constant:true,inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:false,stateMutability:"view",type:"function"},{constant:false,inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"value",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"},{constant:false,inputs:[{internalType:"address",name:"from",type:"address"},{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"value",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],payable:false,stateMutability:"nonpayable",type:"function"}];

/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
function getProvider(chainId, web3) {
    console.log('getProvider (SDK-MONO) -->');
    if (chainId === SupportedChainId.FUSE) {
        return new JsonRpcProvider(process.env.REACT_APP_FUSE_RPC);
    }
    return web3
        ? new Web3Provider(web3.currentProvider)
        : new JsonRpcProvider(RPC[chainId]);
}

/**
 * Returns a contract in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} address Address of the deployed contract.
 * @param {ContractInterface} abi ABI for a contract.
 * @returns {Contract}
 */
function getContract(chainId, addressOrName, abi, web3) {
    var address = addressOrName;
    if (false === addressOrName.startsWith('0x'))
        address = G$ContractAddresses(chainId, addressOrName);
    return new Contract(address, abi, getProvider(chainId, web3));
}

/**
 * Returns instance of GoodMarket contract.
 * @param {SupportedChainId} chainId Given chain ID.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
function PairContract(chainId, address) {
    return getContract(chainId, address, abi);
}

/**
 * Compute pair address between tokens for uniswap.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Token} tokenA Token A.
 * @param {Token} tokenB Token B.
 * @returns {string} Pair address.
 */
var computePairAddress = memoize_1(function (chainId, tokenA, tokenB) {
    var _a;
    if (!tokenA.sortsBefore(tokenB)) {
        _a = __read([tokenB, tokenA], 2), tokenA = _a[0], tokenB = _a[1];
    }
    return getCreate2Address(UNISWAP_FACTORY_ADDRESSES[chainId], keccak256(['bytes'], [pack(['address', 'address'], [tokenA.address, tokenB.address])]), UNISWAP_INIT_CODE_HASH[chainId]);
}, function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args[0] + args[1].symbol + args[2].symbol;
});

var PairState;
(function (PairState) {
    PairState[PairState["EXISTS"] = 0] = "EXISTS";
    PairState[PairState["INVALID"] = 1] = "INVALID";
})(PairState || (PairState = {}));
/**
 * Calculates all existed currency combinations in given chain.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Array<[Currency, Currency]>} currencies Result of method allCurrencyCombinations(...).
 * @returns {Promise<[PairState, Pair | null][]>} List of pairs that can be used for currencies exchange.
 */
function v2Pairs(chainId, currencies) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, pairAddresses, promises, _loop_1, _a, _b, address, result, pairs;
        var e_1, _c;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    tokens = currencies.map(function (_a) {
                        var _b = __read(_a, 2), currencyA = _b[0], currencyB = _b[1];
                        return [currencyA.wrapped, currencyB.wrapped];
                    });
                    pairAddresses = tokens.reduce(function (map, _a) {
                        var _b = __read(_a, 2), tokenA = _b[0], tokenB = _b[1];
                        var address = tokenA.chainId === tokenB.chainId &&
                            !tokenA.equals(tokenB) &&
                            UNISWAP_FACTORY_ADDRESSES[tokenA.chainId]
                            ? computePairAddress(tokenA.chainId, tokenA, tokenB).toLowerCase()
                            : undefined;
                        if (address) {
                            map.set(address, [tokenA, tokenB]);
                        }
                        return map;
                    }, new Map());
                    promises = [];
                    _loop_1 = function (address) {
                        promises.push(new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var data, _a, tokenA, tokenB, e_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, PairContract(chainId, address).getReserves()];
                                    case 1:
                                        data = _b.sent();
                                        _a = __read(pairAddresses.get(address), 2), tokenA = _a[0], tokenB = _a[1];
                                        resolve(__assign(__assign({}, data), { tokenA: tokenA, tokenB: tokenB }));
                                        resolve({ tokenA: tokenA, tokenB: tokenB });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_2 = _b.sent();
                                        reject(e_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }));
                    };
                    try {
                        for (_a = __values(pairAddresses.keys()), _b = _a.next(); !_b.done; _b = _a.next()) {
                            address = _b.value;
                            _loop_1(address);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return [4 /*yield*/, Promise.allSettled(promises)];
                case 1:
                    result = _d.sent();
                    pairs = result.filter(function (pair) { return pair.status === 'fulfilled'; }).map(function (pair) { return pair.value; });
                    return [2 /*return*/, pairs.map(function (pair) {
                            var reserve0 = pair.reserve0, reserve1 = pair.reserve1, tokenA = pair.tokenA, tokenB = pair.tokenB;
                            if (!tokenA || !tokenB || tokenA.equals(tokenB))
                                return [PairState.INVALID, null];
                            var _a = __read(tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA], 2), token0 = _a[0], token1 = _a[1];
                            return [
                                PairState.EXISTS,
                                new Pair(CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0.toString())), CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1.toString()))),
                            ];
                        })];
            }
        });
    });
}

/**
 * Calculates possible pairs in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @returns {Pair[]} List of pairs.
 */
var allCommonPairs = memoize_1(function (chainId, currencyA, currencyB) { return __awaiter(void 0, void 0, void 0, function () {
    var allCurrencyCombinations$1, allPairs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, allCurrencyCombinations(chainId, currencyA, currencyB)];
            case 1:
                allCurrencyCombinations$1 = _a.sent();
                return [4 /*yield*/, v2Pairs(chainId, allCurrencyCombinations$1)
                    // Only pass along valid pairs, non-duplicated pairs.
                ];
            case 2:
                allPairs = _a.sent();
                // Only pass along valid pairs, non-duplicated pairs.
                delayedCacheClear(allCommonPairs);
                return [2 /*return*/, Object.values(allPairs
                        // Filter out invalid pairs.
                        .filter(function (result) { return Boolean(result[0] === PairState.EXISTS && result[1]); })
                        // Filter out duplicated pairs.
                        .reduce(function (memo, _a) {
                        var _b;
                        var _c = __read(_a, 2), curr = _c[1];
                        memo[curr.liquidityToken.address] = (_b = memo[curr.liquidityToken.address]) !== null && _b !== void 0 ? _b : curr;
                        return memo;
                    }, {}))];
        }
    });
}); }, function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args[0] + args[1].symbol + args[2].symbol;
});

/* Used to ensure the user doesn't send so much ETH so they end up with <.01 */
var BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000));
var ZERO_PERCENT = new Percent('0');
var ONE_HUNDRED_PERCENT = new Percent('1');

/**
 * Returns whether tradeB is better than tradeA by at least a threshold percentage amount.
 * @param {Trade} tradeA Trade A.
 * @param {Trade} tradeB Trade B.
 * @param {Percent=ZERO_PERCENT} minimumDelta Minimum delta between trade A and trade B.
 * @returns {boolean | undefined}
 * @throws {Error} If tries to compare incomparable trades.
 */
function isTradeBetter(tradeA, tradeB, minimumDelta) {
    if (minimumDelta === void 0) { minimumDelta = ZERO_PERCENT; }
    if (tradeA && !tradeB)
        return false;
    if (tradeB && !tradeA)
        return true;
    if (!tradeA || !tradeB)
        return undefined;
    if (tradeA.tradeType !== tradeB.tradeType ||
        !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
        !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)) {
        throw new Error('Comparing incomparable trades');
    }
    if (minimumDelta.equalTo(ZERO_PERCENT)) {
        return tradeA.executionPrice.lessThan(tradeB.executionPrice);
    }
    else {
        return tradeA.executionPrice.asFraction
            .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
            .lessThan(tradeB.executionPrice);
    }
}

var MAX_HOPS = 2;
/**
 * Returns the best trade for the token in to the exact amount of token in.
 * @param {CurrencyAmount} currencyAmountIn Currency exchange from
 * @param {Currency} currencyOut Currency exchange to.
 * @param {number=3} maxHops Maximum hops to find the best exchange route.
 * @param {SupportedChainId} chainId Chain ID.
 * @returns {Promise<Trade>}
 */
function v2TradeExactIn(currencyAmountIn, currencyOut, _a) {
    var _b, _c;
    var _d = _a === void 0 ? {} : _a, _e = _d.maxHops, maxHops = _e === void 0 ? MAX_HOPS : _e, _f = _d.chainId, chainId = _f === void 0 ? SupportedChainId.MAINNET : _f;
    return __awaiter(this, void 0, void 0, function () {
        var allowedPairs, bestTradeSoFar, i, currentTrade;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, allCommonPairs(chainId, currencyAmountIn === null || currencyAmountIn === void 0 ? void 0 : currencyAmountIn.currency, currencyOut)];
                case 1:
                    allowedPairs = _g.sent();
                    debug(allowedPairs.map(function (pair) { return [pair.token0.symbol, pair.token0.address, pair.token1.symbol, pair.token1.address]; }));
                    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
                        if (maxHops === 1) {
                            return [2 /*return*/, ((_b = Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0]) !== null && _b !== void 0 ? _b : null)];
                        }
                        bestTradeSoFar = null;
                        for (i = 1; i <= maxHops; i++) {
                            currentTrade = (_c = Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: i, maxNumResults: 1 })[0]) !== null && _c !== void 0 ? _c : null;
                            // if current trade is best yet, save it
                            if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                                bestTradeSoFar = currentTrade;
                            }
                        }
                        return [2 /*return*/, bestTradeSoFar];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}

/**
 * Return list of all stakes.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<Stake[]>}
 */
function getList(web3) {
    return __awaiter(this, void 0, void 0, function () {
        var simpleStakingReleases, result, stakeV3, _a, _b, address, _c, _d, e_1_1;
        var e_1, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('getting list . . . (sdk-mono)');
                    return [4 /*yield*/, getSimpleStakingContractAddressesV3(web3)
                        // cacheClear(getSocialAPY)
                        // cacheClear(getTokenPriceInUSDC)
                        // cacheClear(getReserveRatio)
                        // cacheClear(getAPY)
                        // cacheClear(getStakedValue)
                        // cacheClear(getYearlyRewardGDAO)
                        // cacheClear(getYearlyRewardG$)
                        // console.log('simpleStaking addresses (sdk-mono)', simpleStakingReleases)
                    ];
                case 1:
                    simpleStakingReleases = _f.sent();
                    result = [];
                    stakeV3 = simpleStakingReleases.find(function (releases) { return releases.release === "v3"; });
                    if (!stakeV3) return [3 /*break*/, 9];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 7, 8, 9]);
                    _a = __values(stakeV3.addresses), _b = _a.next();
                    _f.label = 3;
                case 3:
                    if (!!_b.done) return [3 /*break*/, 6];
                    address = _b.value;
                    // console.log('(sdk-mono) addresses v3 -->', address)
                    _d = (_c = result).push;
                    return [4 /*yield*/, metaStake(web3, address)];
                case 4:
                    // console.log('(sdk-mono) addresses v3 -->', address)
                    _d.apply(_c, [_f.sent()]);
                    _f.label = 5;
                case 5:
                    _b = _a.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_1_1 = _f.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/, result];
            }
        });
    });
}
// /**
//  * Return list of all user's stakes.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} account account address to get staking data for.
//  * @returns {Promise<Stake[]>}
//  */
// export async function getMyList(mainnetWeb3: Web3, fuseWeb3: Web3, account: string): Promise<MyStake[]> {
//     const simpleStakingReleases = await getSimpleStakingContractAddressesV3(mainnetWeb3)
//     const governanceStakingAddresses = await getGovernanceStakingContracts()
//     cacheClear(getTokenPriceInUSDC)
//     let stakes: MyStake[] = []
//     try {
//         const govStake = governanceStakingAddresses.map(stake => metaMyGovStake(fuseWeb3, account, stake.address, stake.release))
//         for (const releases of simpleStakingReleases){
//           if (releases.release){
//             for (const [key, address] of Object.entries(releases.addresses)){
//               govStake.push(metaMyStake(mainnetWeb3, address, account, releases.release))
//             }
//           }
//         }
//         const stakesRawList = await Promise.all(govStake)
//         stakes = stakesRawList.filter(Boolean) as MyStake[]
//     } catch (e) {
//         console.log(e)
//     }
//     return stakes
// }
/**
 * Returns meta for each stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<Stake>}
 */
function metaStake(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var simpleStaking, _a, tokenAddress, iTokenAddress, protocolName, _b, token, iToken, protocol, _c, APY, socialAPY, liquidity, rewardG$, rewardGDAO, result;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    simpleStaking = simpleStakingContractV2(web3, address);
                    return [4 /*yield*/, Promise.all([
                            simpleStaking === null || simpleStaking === void 0 ? void 0 : simpleStaking.methods.token().call(),
                            simpleStaking === null || simpleStaking === void 0 ? void 0 : simpleStaking.methods.iToken().call(),
                            simpleStaking === null || simpleStaking === void 0 ? void 0 : simpleStaking.methods.name().call()
                        ])];
                case 1:
                    _a = __read.apply(void 0, [_d.sent(), 3]), tokenAddress = _a[0], iTokenAddress = _a[1], protocolName = _a[2];
                    return [4 /*yield*/, Promise.all([
                            getTokenByAddress(web3, tokenAddress),
                            getTokenByAddress(web3, iTokenAddress)
                        ])];
                case 2:
                    _b = __read.apply(void 0, [(_d.sent()), 2]), token = _b[0], iToken = _b[1];
                    protocol = getProtocol(protocolName);
                    return [4 /*yield*/, Promise.all([
                            getAPY(web3, address, protocol, token),
                            getSocialAPY(web3, protocol, token, iToken),
                            getStakedValuev2(web3, address, protocol, token),
                            getYearlyRewardG$(web3, address),
                            getYearlyRewardGDAO(web3, address)
                        ])];
                case 3:
                    _c = __read.apply(void 0, [_d.sent(), 5]), APY = _c[0], socialAPY = _c[1], liquidity = _c[2], rewardG$ = _c[3], rewardGDAO = _c[4];
                    result = {
                        APY: APY,
                        address: address,
                        protocol: protocol,
                        liquidity: liquidity,
                        rewards: { G$: rewardG$, GDAO: rewardGDAO },
                        socialAPY: socialAPY,
                        tokens: { A: token, B: iToken },
                    };
                    return [2 /*return*/, result];
            }
        });
    });
}
// /**
//  * Returns meta for mine stake with rewards.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  *  @param {string} account account details to fetch.
//  * @returns {Promise<Stake | null>}
//  */
// async function metaMyStake(web3: Web3, address: string, account: string, release: string): Promise<MyStake | null> {
//     debugGroup(`My stake for ${address}`)
//     const isDeprecated = release !== "v3"
//     const isSimpleNew = release !== "v1"
//     const simpleStaking = isSimpleNew ? simpleStakingContractV2(web3, address) : simpleStakingContract(web3, address)
//     const chainId = await getChainId(web3)
//     const users = await simpleStaking.methods.users(account).call()
//     if (!users || parseInt(users.amount.toString()) === 0) {
//         debugGroupEnd(`My stake for ${address}`)
//         return null
//     }
//     const maxMultiplierThreshold = isSimpleNew ? (await simpleStaking.methods.getStats().call())[6] :
//       simpleStaking.methods.maxMultiplierThreshold().call()
//     const [tokenAddress, iTokenAddress, protocolName, threshold] = await Promise.all([
//         simpleStaking.methods.token().call(),
//         simpleStaking.methods.iToken().call(),
//         simpleStaking.methods.name().call(),
//         maxMultiplierThreshold  
//     ])
//     const [token, iToken] = (await Promise.all([
//         getTokenByAddress(web3, tokenAddress),
//         getTokenByAddress(web3, iTokenAddress)
//     ])) as [Token, Token]
//     const protocol = getProtocol(protocolName)
//     const amount = CurrencyAmount.fromRawAmount(token, users.amount.toString())
//     const multiplier = Math.round(Date.now() / 1000) - parseInt(users.multiplierResetTime) > threshold
//     const tokenPrice = await getTokenPriceInUSDC(web3, protocol, token)
//     let amount$: CurrencyAmount<Currency>
//     if (tokenPrice) {
//         const _amountUSDC = amount.multiply(tokenPrice).divide(10 ** token.decimals)
//         amount$ = CurrencyAmount.fromFractionalAmount(USDC[SupportedChainId.MAINNET], _amountUSDC.numerator, _amountUSDC.denominator)
//     } else {
//         amount$ = CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 0)
//     }
//     debug('Amount', amount.toSignificant(6))
//     debug('Amount USDC', amount$.toSignificant(6))
//     const [rewardG$, rewardGDAO] = await Promise.all([
//         getRewardG$(web3, address, account, isSimpleNew),
//         getRewardGDAO(web3, address, account)
//     ])
//     const { cDAI } = await g$Price()
//     const ratio = await cDaiPrice(web3, chainId)
//     const rewardUSDC = {
//         claimed: rewardG$.claimed
//             .multiply(cDAI)
//             .multiply(ratio),
//         unclaimed: rewardG$.unclaimed
//             .multiply(cDAI)
//             .multiply(ratio),
//     }
//     // const DAI = (await getToken(SupportedChainId.MAINNET, 'DAI')) as Token
//     const G$MainNet = G$[SupportedChainId.MAINNET]
//     const result = {
//         address,
//         protocol,
//         multiplier,
//         rewards: {
//             reward: rewardG$,
//             reward$: {
//                 claimed: CurrencyAmount.fromFractionalAmount(
//                   G$MainNet,
//                     rewardUSDC.claimed.numerator,
//                     rewardUSDC.claimed.denominator
//                 ),
//                 unclaimed: CurrencyAmount.fromFractionalAmount(
//                     G$MainNet,
//                     rewardUSDC.unclaimed.numerator,
//                     rewardUSDC.unclaimed.denominator
//                 )
//             },
//             GDAO: rewardGDAO
//         },
//         stake: { amount, amount$ },
//         tokens: { A: token, B: iToken },
//         network: DAO_NETWORK.MAINNET,
//         isDeprecated: isDeprecated,
//         isV2: release === "v2"
//     }
//     debug('Reward $ claimed', result.rewards.reward$.claimed.toSignificant(6))
//     debug('Reward $ unclaimed', result.rewards.reward$.unclaimed.toSignificant(6))
//     debug('Result', result)
//     debugGroupEnd(`My stake for ${address}`)
//     return result
// }
// /**
//  * Returns meta for mine stake with rewards.
//  * @param {Web3} web3 Web3 instance.
//  *  @param {string} account account details to fetch.
//  * @returns {Promise<Stake | null>}
//  */
// async function metaMyGovStake(web3: Web3, account: string, address?: string, release?: string): Promise<MyStake | null> {
//   const govStaking = governanceStakingContract(web3, address)
//   const G$Token = G$[SupportedChainId.FUSE] //gov is always on fuse
//   const usdcToken = USDC[SupportedChainId.MAINNET]
//   const users = await govStaking.methods.users(account).call()
//   if (!users || parseInt(users.amount.toString()) === 0) {
//       return null
//   }
//   const amount = CurrencyAmount.fromRawAmount(G$Token, users.amount.toString())
//   const tokenPrice = await g$Price()
//   let amount$ = CurrencyAmount.fromRawAmount(G$Token, 0)
//   if (tokenPrice) {
//     const value = amount.multiply(tokenPrice.DAI).multiply(1e4)
//     amount$ = CurrencyAmount.fromFractionalAmount(usdcToken, value.numerator, value.denominator)
//   } else {
//     amount$ = CurrencyAmount.fromRawAmount(usdcToken, 0)
//   }
//   const unclaimed = await govStaking.methods.getUserPendingReward(account).call()
//   const rewardGDAO = {
//       claimed: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.MAINNET], users.rewardMinted.toString()),
//       unclaimed: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.MAINNET], unclaimed.toString())
//   }
//   const G$MainToken = G$[SupportedChainId.MAINNET] as Token
//   const result = {
//       address: (govStaking as any)._address,
//       protocol: LIQUIDITY_PROTOCOL.GOODDAO,
//       multiplier: false,
//       rewards: {
//           reward: {
//               claimed: CurrencyAmount.fromRawAmount(G$MainToken, 0),
//               unclaimed: CurrencyAmount.fromRawAmount(G$MainToken, 0)
//           },
//           reward$: {
//               claimed: CurrencyAmount.fromRawAmount(G$MainToken, 0),
//               unclaimed: CurrencyAmount.fromRawAmount(G$MainToken, 0)
//           },
//           GDAO: rewardGDAO
//       },
//       stake: { amount, amount$ },
//       tokens: { A: G$Token, B: G$Token },
//       network: DAO_NETWORK.FUSE,
//       isDeprecated: release !== 'v2',
//     }
//     return result
// }
/**
 * Returns protocol name base on staking contact.
 * @param {string} protocolName Protocol name.
 * @returns {LIQUIDITY_PROTOCOL}
 */
var getProtocol = memoize_1(function (protocolName) {
    var protocol = protocolName.startsWith('GoodCompoundStaking')
        ? LIQUIDITY_PROTOCOL.COMPOUND
        : protocolName.startsWith('GoodAaveStaking')
            ? LIQUIDITY_PROTOCOL.AAVE
            : LIQUIDITY_PROTOCOL.UNKNOWN;
    return protocol;
});
// /**
//  * Return G$ rewards from stake for account.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {string} account User's account address.
//  * @returns {Promise<MyReward>}
//  */
// async function getRewardG$(web3: Web3, address: string, account: string, isDeprecated: boolean): Promise<MyReward> {
//     const simpleStaking = !isDeprecated ? simpleStakingContractV2(web3, address) : simpleStakingContract(web3, address)
//     const { 0: claimed, 1: unclaimed } = await simpleStaking.methods.getUserMintedAndPending(account).call()
//     const chainId = await getChainId(web3)
//     const result = {
//         claimed: CurrencyAmount.fromRawAmount(G$[chainId], claimed),
//         unclaimed: CurrencyAmount.fromRawAmount(G$[chainId], unclaimed)
//     }
//     debug(`Reward G$ claimed`, result.claimed.toSignificant(6))
//     debug(`Reward G$ unclaimed`, result.unclaimed.toSignificant(6))
//     return result
// }
// /**
//  * Return GDAO rewards from stake for account.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {string} account User's account address.
//  */
// async function getRewardGDAO(web3: Web3, address: string, account: string): Promise<MyReward> {
//     const stakersDistribution = await stakersDistributionContract(web3)
//     const chainId = await getChainId(web3)
//     const { 0: claimed, 1: unclaimed } = await stakersDistribution.methods
//         .getUserMintedAndPending([address], account)
//         .call()
//     const result = {
//         claimed: CurrencyAmount.fromRawAmount(GDAO[chainId], claimed),
//         unclaimed: CurrencyAmount.fromRawAmount(GDAO[chainId], unclaimed)
//     }
//     debug('Reward GDAO claimed', result.claimed.toSignificant(6))
//     debug('Reward GDAO unclaimed', result.unclaimed.toSignificant(6))
//     return result
// }
/**
 * Return social APY.
 * @param {Web3} web3 Web3 instance.
 * @param {string} protocol Web3 instance.
 * @param {Token} token Token.
 * @param {Token} iToken Interest token.
 * @returns {Promise<Fraction>>}
 */
var getSocialAPY = memoize_1(function (web3, protocol, token, iToken) { return __awaiter(void 0, void 0, void 0, function () {
    var chainId, RR, socialAPY, result, supplyAPY, incentiveAPY;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getChainId(web3)];
            case 1:
                chainId = _a.sent();
                return [4 /*yield*/, getReserveRatio(web3, chainId)];
            case 2:
                RR = _a.sent();
                socialAPY = new Fraction(0);
                result = { supplyAPY: socialAPY, incentiveAPY: socialAPY };
                if (!!RR.equalTo(0)) return [3 /*break*/, 6];
                if (!(protocol === LIQUIDITY_PROTOCOL.COMPOUND)) return [3 /*break*/, 4];
                return [4 /*yield*/, compoundStaking(chainId, iToken.address)];
            case 3:
                result = _a.sent();
                return [3 /*break*/, 6];
            case 4:
                if (!(protocol === LIQUIDITY_PROTOCOL.AAVE)) return [3 /*break*/, 6];
                return [4 /*yield*/, aaveStaking(chainId, token)];
            case 5:
                result = _a.sent();
                _a.label = 6;
            case 6:
                supplyAPY = result.supplyAPY, incentiveAPY = result.incentiveAPY;
                socialAPY = supplyAPY
                    .multiply(100)
                    .add(incentiveAPY)
                    .divide(RR);
                debug('Social APY', socialAPY.toFixed(2));
                return [2 /*return*/, socialAPY];
        }
    });
}); }, function (_, protocol, a, b) { return protocol + a.address + b.address; });
/**
 * Return price of token in $ (USDC token).
 * @param {Web3} web3 Web3 instance.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
var getTokenPriceInUSDC = memoize_1(function (web3, protocol, token) { return __awaiter(void 0, void 0, void 0, function () {
    var chainId, amount, underlying, ratio, underlyingAmount, price, usdcT, trade;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, getChainId(web3)];
            case 1:
                chainId = _c.sent();
                "".concat(token.symbol, " price in USDC");
                amount = CurrencyAmount.fromRawAmount(token, Math.pow(10, token.decimals));
                if (!(protocol === LIQUIDITY_PROTOCOL.COMPOUND && ((_a = token.symbol) === null || _a === void 0 ? void 0 : _a.startsWith('c')))) return [3 /*break*/, 4];
                return [4 /*yield*/, getToken(chainId, (_b = token.symbol) === null || _b === void 0 ? void 0 : _b.substring(1))];
            case 2:
                underlying = (_c.sent());
                if (!underlying) return [3 /*break*/, 4];
                return [4 /*yield*/, compoundPrice(web3, token.address, chainId)];
            case 3:
                ratio = _c.sent();
                debug('Ratio', ratio.toSignificant(6));
                underlyingAmount = amount.multiply(ratio);
                if (underlying.decimals - token.decimals > 0) {
                    underlyingAmount = underlyingAmount.multiply(Math.pow(10, (underlying.decimals - token.decimals)));
                }
                else {
                    underlyingAmount = underlyingAmount.divide(Math.pow(10, (token.decimals - underlying.decimals)));
                }
                amount = CurrencyAmount.fromFractionalAmount(underlying, underlyingAmount.numerator, underlyingAmount.denominator);
                token = underlying;
                _c.label = 4;
            case 4:
                debug('Token amount', amount.toSignificant(6));
                if (token.symbol === 'USDC') {
                    debug('Price', amount.toSignificant(6));
                    return [2 /*return*/, amount];
                }
                price = null;
                if (!(protocol === LIQUIDITY_PROTOCOL.COMPOUND)) return [3 /*break*/, 6];
                usdcT = USDC[SupportedChainId.MAINNET];
                return [4 /*yield*/, v2TradeExactIn(amount, usdcT, { chainId: chainId, maxHops: 2 })];
            case 5:
                trade = _c.sent();
                if (trade) {
                    debug('Price', trade.outputAmount.toSignificant(6));
                    price = trade.outputAmount;
                }
                return [3 /*break*/, 7];
            case 6:
                if (protocol === LIQUIDITY_PROTOCOL.AAVE) {
                    price = new Fraction(1);
                    debug('Price', price.toSignificant(6));
                }
                _c.label = 7;
            case 7:
                return [2 /*return*/, price];
        }
    });
}); }, function (_, protocol, token) { return protocol + token.address; });
// export const getReserveSocialAPY = memoize<(web3: Web3, chainId: number) => Promise<Fraction>>(
//     async (web3, chainId) => {
//         const marketMaker = await goodMarketMakerContract(web3)
//         const [{ reserveRatio, reserveSupply, gdSupply }, currentPrice, dailyExpansionRate] = await Promise.all([
//             marketMaker.methods.reserveTokens(CDAI[chainId].address).call(),
//             marketMaker.methods.currentPrice(CDAI[chainId].address).call(),
//             marketMaker.methods.reserveRatioDailyExpansion().call()
//         ])
//         // (reservebalance / (newreserveratio * currentprice)) - gdsupply
//         const rr = reserveRatio / 1e6
//         const yearlyDecline = (2 - dailyExpansionRate / 1e27) ** 365
//         const newRR = rr * (2 - yearlyDecline)
//         const denom = newRR * (currentPrice / 1e8)
//         const gdGenerated = reserveSupply / 1e8 / denom - gdSupply / 1e2
//         const socialAPY = new Fraction((gdGenerated * 1e2).toFixed(0), gdSupply).multiply(100) //mul by 100 to return as percentages
//         return socialAPY
//     },
//     (_, chainId) => chainId
// )
/**
 * Returns reserve ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Promise<Fraction>>}
 */
var getReserveRatio = memoize_1(function (web3, chainId) { return __awaiter(void 0, void 0, void 0, function () {
    var marketMaker, reserveRatio, reserveRatioFraction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, goodMarketMakerContract(web3)];
            case 1:
                marketMaker = _a.sent();
                return [4 /*yield*/, marketMaker.methods.reserveTokens(CDAI[chainId].address).call()];
            case 2:
                reserveRatio = (_a.sent()).reserveRatio;
                reserveRatioFraction = new Fraction(reserveRatio.toString(), 1e6);
                debug('Reserve ratio', reserveRatioFraction.toSignificant(6));
                return [2 /*return*/, reserveRatioFraction];
        }
    });
}); }, function (_, chainId) { return chainId; });
/**
 * Return APY.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
var getAPY = memoize_1(function (web3, address, protocol, token) { return __awaiter(void 0, void 0, void 0, function () {
    var G$Ratio, yearlyRewardG$, stakedValue, APY;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                debugGroup("APY of ".concat(protocol, " for ").concat(token.symbol));
                return [4 /*yield*/, g$Price()];
            case 1:
                G$Ratio = (_a.sent()).DAI;
                return [4 /*yield*/, getYearlyRewardG$(web3, address)];
            case 2:
                yearlyRewardG$ = _a.sent();
                return [4 /*yield*/, getStakedValuev2(web3, address, protocol, token, true)];
            case 3:
                stakedValue = _a.sent();
                stakedValue = stakedValue.equalTo(0)
                    ? CurrencyAmount.fromRawAmount(stakedValue.currency, Math.pow(10, stakedValue.currency.decimals) * 1000) //1000$
                    : stakedValue;
                APY = yearlyRewardG$
                    .multiply(G$Ratio)
                    .multiply(yearlyRewardG$.decimalScale)
                    .divide(stakedValue)
                    .multiply(1e6);
                debug('APY', APY.toSignificant(6));
                debugGroupEnd("APY of ".concat(protocol, " for ").concat(token.symbol));
                return [2 /*return*/, APY];
        }
    });
}); }, function (_, address, protocol, token) { return address + protocol + token.address; });
// /**
//  * Return liquidity.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
//  * @param {Token} token Token for calculation price from.
//  * @returns {Promise<Fraction>>}
//  */
// const getLiquidity = memoize<
//     (web3: Web3, address: string, protocol: LIQUIDITY_PROTOCOL, token: Token) => Promise<Fraction>
// >(
//     async (web3, address, protocol, token) => {
//         const chainId = await getChainId(web3)
//         const simpleStaking = await simpleStakingContract(web3, address)
//         debugGroup(`Liquidity for ${token.symbol} in ${protocol} `)
//         const zero = new Fraction(0)
//         const account = await getAccount(web3)
//         const price = await getTokenPriceInUSDC(web3, protocol, token)
//         if (!price) {
//             debug('Liquidity', zero)
//             return zero
//         }
//         const USDC = (await getToken(chainId, 'USDC')) as Token
//         const totalProductivity = await simpleStaking.methods.totalProductivity().call()
//         debug('Total Productivity', totalProductivity)
//         const liquidity = new Fraction(totalProductivity.toString(), 1).multiply(price).divide(10 ** token.decimals)
//         const liquidityUSDC = CurrencyAmount.fromFractionalAmount(USDC, liquidity.numerator, liquidity.denominator)
//         debug('Liquidity', liquidityUSDC.toSignificant(6))
//         debugGroupEnd(`Liquidity for ${token.symbol} in ${protocol}`)
//         return liquidityUSDC
//     },
//     (_, address, protocol, token) => address + protocol + token.address
// )
/**
 * Return staked value in USD for SimpleStaking V2.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @param {boolean} effectiveStake get effective stakes, not donated
 * @returns {Promise<Fraction>>}
 */
var getStakedValuev2 = memoize_1(function (web3, address, protocol, token, effectiveStake) {
    if (effectiveStake === void 0) { effectiveStake = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var chainId, simpleStakingv2, _a, _totalProductivity, _totalEffectiveStakes, _tokenDecimalDifference, USDC, tempOracle, totalProductivity, usdValue, liquidityUSDC;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getChainId(web3)];
                case 1:
                    chainId = _b.sent();
                    simpleStakingv2 = getContract(chainId, address, [
                        'function getStats() view returns (' +
                            'uint256,uint128,uint128,uint128,' +
                            'uint128,uint128,uint64,uint8)',
                        'function tokenUsdOracle() view returns (address)',
                        'function getTokenValueInUSD(address, uint256, uint256) view returns (uint256)'
                    ], web3);
                    return [4 /*yield*/, simpleStakingv2.getStats()];
                case 2:
                    _a = _b.sent(), _totalProductivity = _a[2], _totalEffectiveStakes = _a[3], _tokenDecimalDifference = _a[7];
                    return [4 /*yield*/, getToken(chainId, 'USDC')];
                case 3:
                    USDC = (_b.sent());
                    tempOracle = getUsdOracle(protocol, web3);
                    totalProductivity = effectiveStake ? _totalEffectiveStakes : _totalProductivity;
                    return [4 /*yield*/, simpleStakingv2.getTokenValueInUSD(tempOracle, totalProductivity, 18 - _tokenDecimalDifference)];
                case 4:
                    usdValue = _b.sent();
                    liquidityUSDC = CurrencyAmount.fromRawAmount(USDC, usdValue.div(1e2).toString()) //token value in usd is in 8 decimals
                    ;
                    debug('Liquidity staked', liquidityUSDC.toSignificant(6));
                    debugGroupEnd("Liquidity for ".concat(token.symbol, " in ").concat(protocol));
                    return [2 /*return*/, liquidityUSDC];
            }
        });
    });
}, function (_, address, protocol, token, effectiveStake) { return address + protocol + token.address + effectiveStake; });
/**
 * Return staked value in USD.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @param {boolean} effectiveStake get effective stakes, not donated
 * @returns {Promise<Fraction>>}
 */
memoize_1(function (web3, address, protocol, token, effectiveStake) {
    if (effectiveStake === void 0) { effectiveStake = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var chainId, simpleStaking, _a, totalProductivity, usdOracle, tokenDecimalsDiffFrom18, usdValue, token1, liquidityUsdValue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getChainId(web3)];
                case 1:
                    chainId = _b.sent();
                    simpleStaking = getContract(chainId, address, [
                        'function totalProductivity() view returns (uint256)',
                        'function totalEffectiveStakes() view returns (uint256)',
                        'function tokenUsdOracle() view returns (address)',
                        'function getTokenValueInUSD(address, uint256, uint256) view returns (uint256)',
                        'function tokenDecimalDifference() view returns (uint256)'
                    ], web3);
                    return [4 /*yield*/, Promise.all([
                            effectiveStake ? simpleStaking.totalEffectiveStakes() : simpleStaking.totalProductivity(),
                            simpleStaking.tokenUsdOracle(),
                            simpleStaking.tokenDecimalDifference()
                        ])];
                case 2:
                    _a = __read.apply(void 0, [_b.sent(), 3]), totalProductivity = _a[0], usdOracle = _a[1], tokenDecimalsDiffFrom18 = _a[2];
                    return [4 /*yield*/, simpleStaking.getTokenValueInUSD(usdOracle, totalProductivity, 18 - tokenDecimalsDiffFrom18.toNumber())];
                case 3:
                    usdValue = _b.sent();
                    token1 = new Token(1, '0x0000000000000000000000000000000000000001', 6);
                    liquidityUsdValue = CurrencyAmount.fromRawAmount(token1, usdValue.div(1e2).toString());
                    debug('Liquidity staked', liquidityUsdValue.toSignificant(6));
                    debugGroupEnd("Liquidity for ".concat(token.symbol, " in ").concat(protocol));
                    return [2 /*return*/, liquidityUsdValue];
            }
        });
    });
}, function (_, address, protocol, token, effectiveStake) { return address + protocol + token.address + effectiveStake; });
/**
 * GDAO yearly reward.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<CurrencyAmount<Currency>>}
 */
var getYearlyRewardGDAO = memoize_1(function (web3, address) { return __awaiter(void 0, void 0, void 0, function () {
    var contract, chainId, rewards, yearlyRewardGDAO;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, stakersDistributionContract(web3)];
            case 1:
                contract = _a.sent();
                return [4 /*yield*/, getChainId(web3)];
            case 2:
                chainId = _a.sent();
                return [4 /*yield*/, contract.methods.rewardsPerBlock(address).call()];
            case 3:
                rewards = _a.sent();
                yearlyRewardGDAO = CurrencyAmount.fromRawAmount(GDAO[chainId], rewards.toString()).multiply(2104400);
                debug('Yearly reward GDAO', address, rewards, yearlyRewardGDAO.toSignificant(6));
                return [2 /*return*/, yearlyRewardGDAO];
        }
    });
}); }, function (_, address) { return address; });
/**
 * G$ yearly reward.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<CurrencyAmount<Currency>>>}
 */
var getYearlyRewardG$ = memoize_1(function (web3, address) { return __awaiter(void 0, void 0, void 0, function () {
    var contract, chainId, blockReward, yearlyRewardG$;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, goodFundManagerContract(web3)];
            case 1:
                contract = _a.sent();
                return [4 /*yield*/, getChainId(web3)];
            case 2:
                chainId = _a.sent();
                return [4 /*yield*/, contract.methods.rewardsForStakingContract(address).call()];
            case 3:
                blockReward = (_a.sent()).blockReward;
                yearlyRewardG$ = CurrencyAmount.fromRawAmount(G$[chainId], blockReward.toString()).multiply(2104400);
                debug('Yearly reward G$', yearlyRewardG$.toSignificant(6));
                return [2 /*return*/, yearlyRewardG$];
        }
    });
}); }, function (_, address) { return address; });
// /**
//  * Common information for approve token spend and stake.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {number} amount Amount of tokens to stake.
//  * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
//  * @returns {Promise<{ address: string, amount: string }}
//  */
// async function stakeMeta(
//     web3: Web3,
//     address: string,
//     amount: number | string,
//     inInterestToken = false
// ): Promise<{ address: string; amount: string }> {
//     const contract = simpleStakingContract(web3, address)
//     let tokenAddress
//     if (inInterestToken) {
//         tokenAddress = await contract.methods.iToken().call()
//     } else {
//         tokenAddress = await contract.methods.token().call()
//     }
//     const token = (await getTokenByAddress(web3, tokenAddress)) as Token
//     const tokenAmount = CurrencyAmount.fromRawAmount(token, decimalToJSBI(amount, token.decimals))
//     const tokenRawAmount = tokenAmount.multiply(tokenAmount.decimalScale).toFixed(0)
//     debug('Amount', tokenAmount.toSignificant(6))
//     debug('In interest token', inInterestToken)
//     return { address: tokenAddress, amount: tokenRawAmount }
// }
// /**
//  * Approve token spend for stake.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {number} amount Amount of tokens to stake.
//  * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
//  * @param {function} [onSent] calls when a transaction sent to a blockchain
//  * @returns {Promise<void>}
//  */
// export async function approve(
//     web3: Web3,
//     spender: string,
//     amount: string,
//     token: Token,
//     onSent?: (transactionHash: string) => void
// ): Promise<void> {
//     const account = await getAccount(web3)
//     const tokenAmount = amount.toBigNumber(token.decimals)
//     // const meta = await stakeMeta(web3, address, amount, inInterestToken)
//     const erc20 = ERC20Contract(web3, token.address)
//     const allowance = await erc20.methods
//         .allowance(account, spender)
//         .call()
//         .then((_: string) => BigNumber.from(_))
//     if (tokenAmount.lte(allowance)) return
//     const req = ERC20Contract(web3, token.address)
//         .methods.approve(spender, MaxApproveValue.toString())
//         .send({ from: account })
//     if (onSent) req.on('transactionHash', onSent)
//     await req
// }
// /**
//  * Make a stake in the governance staking contract
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {number} amount Amount of tokens to stake.
//  * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
//  * @param {function} [onSent] calls when a transaction sent to a blockchain
//  * @returns {Promise<void>}
//  */
// export async function stakeGov(
//     web3: Web3,
//     address: string,
//     amount: string,
//     token: Token,
//     inInterestToken = false, //unused - only for compatability with the stake method
//     onSent?: (transactionHash: string, from: string) => void
// ): Promise<TransactionDetails> {
//     const contract = governanceStakingContract(web3, address)
//     const account = await getAccount(web3)
//     const tokenAmount = amount.toBigNumber(token.decimals)
//     const req = contract.methods.stake(tokenAmount).send({ from: account })
//     if (onSent) req.on('transactionHash', (hash: string) =>  onSent(hash, account))
//     return req
// }
// /**
//  * Make a stake.
//  * @param {Web3} web3 Web3 instance.
//  * @param {string} address Stake address.
//  * @param {number} amount Amount of tokens to stake.
//  * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
//  * @param {function} [onSent] calls when a transaction sent to a blockchain
//  * @returns {Promise<void>}
//  */
// export async function stake(
//     web3: Web3,
//     address: string,
//     amount: string,
//     token: Token,
//     inInterestToken = false,
//     onSent?: (transactionHash: string, from: string) => void
// ): Promise<TransactionDetails> {
//     const contract = simpleStakingContractV2(web3, address)
//     const account = await getAccount(web3)
//     const percentage = decimalPercentToPercent(0)
//     const tokenAmount = amount.toBigNumber(token.decimals)
//     const req = contract.methods.stake(tokenAmount, percentage.toFixed(0), inInterestToken).send({ from: account })
//     if (onSent) req.on('transactionHash', (hash: string) =>  onSent(hash, account))
//     return req
// }
// /**
//  * Withdraw a stake.
//  * @param {Web3} web3 Web3 instance.
//  * @param {MyStake} stake Stake address.
//  * @param {string} percentage How much to withdraw in percentages.
//  * @param {function} [onSent] calls when a transaction sent to a blockchain
//  * @returns {Promise<void>}
//  */
// export async function withdraw(
//     web3: Web3,
//     stake: MyStake,
//     percentage: string,
//     withdrawIntoInterestToken?: boolean,
//     onSent?: (transactionHash: string, from: string) => void,
//     onReceipt?: () => void,
//     onError?: (e:any) => void
// ): Promise<TransactionDetails> {
//     const contract =
//         stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO
//             ? governanceStakingContract(web3, stake.address) :
//         !stake.isDeprecated || stake.isV2 ? simpleStakingContractV2(web3, stake.address) :
//                               simpleStakingContract(web3, stake.address)
//     const account = await getAccount(web3)
//     const toWithdraw = stake.stake.amount
//         .multiply(new Percent(percentage, 100))
//         .multiply(stake.stake.amount.decimalScale)
//         .toFixed(0)
//     let req
//     if (stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO)
//         req = contract.methods.withdrawStake(toWithdraw).send({ from: account })
//     else req = contract.methods.withdrawStake(toWithdraw, withdrawIntoInterestToken).send({ from: account })
//     if (onSent) req.on('transactionHash', (hash: string) => onSent(hash, account))
//     if (onReceipt) req.on('receipt', onReceipt)
//     if (onError) req.on('error', onError)
//     return req
// }
// /**
//  * Claim GOOD rewards from staking.
//  * @param {Web3} web3 Web3 instance.
//  * @param {function} [onSent] calls when transactions sent to a blockchain
//  */
// export async function claimGood(
//     web3: Web3,
//     onSent?: (firstTransactionHash: string, from: string, chainId: number) => void,
//     onReceipt?: () => void,
//     onError?: (e:any) => void
// ): Promise<TransactionDetails[]> {
//     const chainId = await getChainId(web3)
//     const account = await getAccount(web3)
//     const transactions: any[] = []
//     if (chainId === SupportedChainId.FUSE) {
//         const contract = governanceStakingContract(web3)
//         transactions.push(contract.methods.withdrawRewards().send({ from: account }))
//     } else {
//         const stakersDistribution = await stakersDistributionContract(web3)
//         const simpleStakingReleases = await getSimpleStakingContractAddressesV3(web3)
//         const simpleStakingAddresses: any[] = []
//         const stakeV3 = simpleStakingReleases.find(releases => releases.release === "v3")
//         if (stakeV3){
//           for (const [key, address] of Object.entries(stakeV3.addresses)){
//             simpleStakingAddresses.push(address)
//           }
//         }
//         transactions.push(stakersDistribution.methods.claimReputation(account, simpleStakingAddresses).send({ from: account }))
//     }
//     if (onSent)
//       Promise.all(
//         transactions.map(
//           transaction => 
//             new Promise<string>((resolve, reject) => {
//               transaction.on('transactionHash', (hash: string) => onSent(hash, account, chainId))
//               transaction.on('receipt', onReceipt)
//               transaction.on('error', reject)
//               resolve('done')
//           }) 
//         )
//       )
//     return Promise.all(transactions)
// }
// /**
//  * Claim G$ rewards from staking.
//  * @param {Web3} web3 Web3 instance.
//  * @param {function} [onSent] calls when transactions sent to a blockchain
//  */
// export async function claim(
//     web3: Web3,
//     onSent?: (firstTransactionHash: string, from: string, chainId: number) => void,
//     onReceipt?: () => void
// ): Promise<TransactionDetails[]> {
//     const chainId = await getChainId(web3)
//     const account = await getAccount(web3)
//     const simpleStakingReleases = await getSimpleStakingContractAddressesV3(web3)
//     const transactions: any[] = []
//     const stakeV3 = simpleStakingReleases.find(releases => releases.release === "v3")
//     if (stakeV3) {
//       for (const [key, address] of Object.entries(stakeV3.addresses)){
//         const [rewardG$, rewardGDAO] = await Promise.all([
//           getRewardG$(web3, address, account, false),
//           getRewardGDAO(web3, address, account)
//         ])
//         if (!rewardG$.unclaimed.equalTo(0)) {
//           const simpleStaking = simpleStakingContractV2(web3, address)
//           transactions.push(simpleStaking.methods.withdrawRewards().send({ from: account }))
//         }
//       }
//     }
//     if (onSent) {
//         Promise.all(
//             transactions.map(
//                 transaction =>
//                     new Promise<string>((resolve, reject) => {
//                         transaction.on('transactionHash', (hash: string) => onSent(hash, account, chainId))
//                         transaction.on('receipt', onReceipt)
//                         transaction.on('error', reject)
//                         resolve('done')
//                     }) 
//             )
//         )
//     }
//     return Promise.all(transactions)
// }

export { getTokenPriceInUSDC as a, getReserveRatio as b, getList as g };
