// ==========================================================================
// ISC License
// Copyright (c) 2015-2018, Andrea Giammarchi, @WebReflection
// 
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
// OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.
// ===========================================================================
/*! (c) Andrea Giammarchi - ISC */
function broadcast() {
  var map = new Map;
  return {
    all: all,
    drop: drop,
    new: broadcast,
    that: that,
    when: when
  };
  function all(type, c) {
    var _ = _get(type);
    if (_.c.indexOf(c) < 0)
      _.c.push(c);
    when(type, c);
  }
  function drop(type, c) {
    var _ = _get(type);
    if (1 < arguments.length) {
      _cancel(_.c, c);
      _cancel(_.f, c);
    }
    else
      map.delete(type);
  }
  function that(type, value) {
    if (1 < arguments.length) {
      var _ = _get(type);
      _.$ = Promise.resolve(value);
      while (_.f.length) _.$.then(_.f.shift());
      while (_.r.length) _.$.then(_.r.shift());
      _.f.push.apply(_.f, _.c);
    }
    else
      return that.bind(null, type);
  }
  function when(type, f?: Function): void | Promise<void> {
    var _ = _get(type);
    if (_.$ !== null)
      _.$.then(that.bind(null, type));
    if (1 < arguments.length) {
      if (_.f.indexOf(f) < 0)
        _.f.push(f);
    }
    else
      return new Promise(function (r) { _.r.push(r); });
  }
  function _cancel(a, f) {
    var i = a.indexOf(f);
    if (-1 < i)
      a.splice(i, 1);
  }
  function _get(type) {
    return map.get(type) || _set(type);
  }
  function _set(type) {
    var _ = {c: [], f: [], r: [], $: null};
    map.set(type, _);
    return _;
  }
}

export default broadcast();
