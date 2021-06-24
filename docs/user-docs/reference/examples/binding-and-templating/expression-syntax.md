---
description: "Binding expression examples,\_demonstrating valid syntax and options."
---

# Expression Syntax

Aurelia's expression parser implements a subset of [ECMAScript Expressions](https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions). For the features that are supported, you can typically expect the JavaScript in your view to work the same way as it would in your view-model, or in the browser console. In addition there are two adjustments:

* The Ampersand `&` represents a `BindingBehavior` \(instead of Bitwise AND\)
* The Bar `|` represents a `ValueConverter` \(instead of a Bitwise OR\)

Non-expression syntax \(statements, declarations, function and class definitions\) is not supported.

As an overview of various expressions that are possible, the following list is for illustrative purposes and not exhaustive \(and not necessarily recommended, either\), but should give you a fairly good idea of what you can do.

## Primary Expressions

### Identifiers

* `foo` - The `foo` variable in the current view-model
* `ßɑṙ` - The `ßɑṙ` variable in the current view-model

{% hint style="info" %}
**Info**

non-ASCII characters in the [Latin](https://en.wikipedia.org/wiki/Latin_script_in_Unicode#Table_of_characters) script are supported. This script contains 1,350 characters covering the vast majority of languages. Other [Non-BMP characters / Surrogate Pairs](https://en.wikipedia.org/wiki/Plane_%28Unicode) are not supported.
{% endhint %}

### Identifiers with special meaning in Aurelia

* `$this` - The current view-model
* `$parent` - The parent view-model

### Primitive literals

* `true` - The literal value `true`
* `false` - The literal value `false`
* `null` - The literal value `null`
* `undefined` - The literal value `undefined`

### String literals and escape sequences

* `'foo'` or `"foo"` - The literal string `foo`
* `'\n'` - The literal string `[NEWLINE]`
* `'\t'` - The literal string `[TAB]`
* `'\''` - The literal string `'`
* `'\\'` - The literal string `\`
* `'\\n'` - The literal string `\n`
* `'\u0061'` - The literal string `a`

{% hint style="warning" %}
**Warning**

Unsupported string literals include `'\x61'` \(2-point hex escape\), `'\u{61}'` or `'\u{000061}'` \(n-point braced unicode escape\), and Non-BMP characters and Surrogate Pairs.
{% endhint %}

### Template literals

* ```foo```  - Equivalent to `'foo'`
* ```foo\${bar}baz\${qux}quux```  - Equivalent to `'foo'+bar+'baz'+qux+'quux'`

#### Numeric literals

* `42` - The literal number `42`
* `42.` or `42.0` - The literal number `42.0`
* `.42` or `0.42` - The literal number `0.42`
* `42.3` - The literal number `42.3`
* `10e3` or `10E3` - The literal number `1000`

{% hint style="warning" %}
**Warning**

Unsupported numeric literals include `0b01` \(binary integer literal\), `0o07` \(octal integer literal\), and `0x0F` \(hex integer literal\).
{% endhint %}

### Array literals

* `[]` - An empty array
* `[1,2,3]` - An array containing the literal numbers `1`, `2` and `3`
* `[foo, bar]` - An array containing the variables `foo` and `bar`
* `[[]]` - An array containing an empty array

{% hint style="warning" %}
**Warning**

Unsupported array literals include `[,]` - [Elision](https://tc39.github.io/ecma262/#prod-Elision)
{% endhint %}

### Object literals

* `{}` - An empty object
* `{foo}` or `{foo,bar}` - ES6 shorthand notation, equivalent to `{'foo':foo}` or `{'foo':foo,'bar':bar}`
* `{42:42}` - Equivalent to `{'42':42}`

{% hint style="warning" %}
**Warning**

Unsupported object literals include `{[foo]: bar}` or `{['foo']: bar}` \(computed property names\).
{% endhint %}

## Unary Expressions

**`foo` here represents any valid primary expression or unary expression.**

* `+foo` or `+1` - Equivalent to `foo` or `1` \(the `+` unary operator is always ignored\)
* `-foo` or `-1` - Equivalent to `0-foo` or `0-1`
* `!foo` - Negates `foo`
* `typeof foo` - Returns the primitive type name of `foo`
* `void foo` - Evaluates `foo` and returns `undefined`

{% hint style="warning" %}
**Warning**

Unary increment \(`++foo` or `foo++`\), decrement \(`--foo` or `foo--`\), bitwise \(`~`\), `delete`, `await` and `yield` operators are not supported.
{% endhint %}

## Binary Expressions \(from highest to lowest precedence\)

**`a` and `b` here represent any valid primary, unary or binary expression.**

* `a*b` or `a/b` or `a%b` - Multiplicative
* `a+b` or `a-b` - Additive
* `a<b` or `a>b` or `a<=b` or `a>=b` or `a in b` or `a instanceof b` - Relational
* `a==b` or `a!=b` or `a===b` or `a!==b` - Equality
* `a&&b` - Logical AND
* `a||b` - Logical OR

{% hint style="warning" %}
**Warning**

Exponentiation \(`a**b`\) and bitwise operators are not supported.
{% endhint %}

## Conditional Expressions

**`foo` etc here represent any valid primary, unary, binary or conditional expression.**

* `foo ? bar : baz`
* `foo ? bar : baz ? qux : quux`

## Assignment Expressions

**`foo` here must be an assignable expression \(a simple accessor, a member accessor or an indexed member accessor\). `bar` can any valid primary, unary, binary, conditional or assignment expression.**

* `foo = bar`
* `foo = bar = baz`

## Member and Call Expressions

Member expressions with special meaning in Aurelia:

* `$parent.foo` - Access the `foo` variable in the parent view-model
* `$parent.$parent.foo` - Access the `foo` variable in the parent's parent view-model
* `$this` - Access the current view-model \(equivalent to simply `this` inside the view-model if it's an ES class\)

Normal member and call expressions:

**`foo` here represents any valid member, call, assignment, conditional, binary, unary or primary expression \(provided the expression as a whole is also valid JavaScript\).**

* `foo.bar` - Member accessor
* `foo['bar']` - Keyed member accessor
* `foo()` - Function call
* `foo.bar()` - Member function call
* `foo['bar']()` - Keyed member function call

Tagged template literals:

**`foo` here should be a function that can be called. The string parts of the template are passed as an array to the first argument and the expression parts are passed as consecutive arguments.**

* ``foo`bar```  - Equivalent to `foo(['bar'])`
* ``foo`bar\${baz}qux```  - Equivalent to `foo(['bar','qux'], baz)`
* ``foo`bar\${baz}qux\${quux}corge```  - Equivalent to `foo(['bar','qux','corge'],baz,quux)`
* ``foo`\${bar}\${baz}\${qux}```  - Equivalent to `foo(['','','',''],bar,baz,qux)`

## Binding Behaviors and Value Converters

These are not considered to be a part of normal expressions and must always come at the end of an expression \(though multiple can be chained\). Furthermore, BindingBehaviors must come after ValueConverters. \(note: BindingBehavior and ValueConverter are abbreviated to BB and VC for readability\)

Valid BB expressions:

* `foo & bar & baz` - Applies the BB `bar` to the variable `foo`, and then applies the BB `baz` to the result of that.
* `foo & bar:'baz'` - Applies the BB `bar` to the variable `foo`, and passes the literal string `'baz'` as an argument to the BB
* `foo & bar:baz:qux` - Applies the BB `bar` to the variable `foo`, and passes the variables `baz` and `qux` as arguments to the BB
* `'foo' & bar` - Applies the BB `bar` to the literal string `'foo'`

Valid VC expressions \(likewise\):

* `foo | bar | baz`
* `foo | bar:'baz'`
* `foo | bar:baz:qux`
* `'foo' | bar`

Combined BB and VC expressions:

* `foo | bar & baz`
* `foo | bar:42:43 & baz:'qux':'quux'`
* `foo | bar | baz & qux & quux`

Invalid combined BB and VC expressions \(BB must come at the end\):

* `foo & bar | baz`
* `foo | bar & baz | qux`

