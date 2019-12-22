export const functionTemplate = `
# {{ name | mdEscape | replaceWith }}
<br/>
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Modifier(s)                            | Return Type                     | Generator                        | Overload                         | Implementation                        |
|----------------------------------------|---------------------------------|:--------------------------------:|:--------------------------------:|:-------------------------------------:|
| {{ modifiers | join(', ','declare') }} | {{ returnType | typeRenderer }} | {{ isGenerator | print_symbol }} | {{ isOverload | print_symbol }}  | {{ isImplementation | print_symbol }} |
<br/>
{% if typeGuard %}
    ## ✦ Type Guard
    | On                             |
    |--------------------------------|
    | {{ typeGuard | typeRenderer }} |
{% endif %}
<br/>
{% if typeParameters %}
    ## ✦ Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if parameters %}
        ## ✦ Parameter(s)
        {% for p in parameters %}
        &nbsp;&nbsp; _**{{ p.name | mdEscape }}**_
        <br/>
        | Modifier(s)                              | Type                        | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
        |------------------------------------------|-----------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
        | {{ p.modifiers | join(', ','declare') }} | {{ p.type | typeRenderer }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |
        <br/>
    {% endfor %}
{% endif %}
`;
