export const functionTemplate = `
{% if comment %}
    # &#128366; Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
<br/>
| Modifier(s)                            | Return Type                    | Generator                        | Overload                         | Implementation                        |
|----------------------------------------|--------------------------------|:--------------------------------:|:--------------------------------:|:-------------------------------------:|
| {{ modifiers | join(', ','declare') }} | {{ returnType | typeRenderer}} | {{ isGenerator | print_symbol }} | {{ isOverload | print_symbol }}  | {{ isImplementation | print_symbol }} |
<br/>
{% if typeGuard %}
    # &#128712; Type Guard
    | On                             |
    |--------------------------------|
    | {{ typeGuard | typeRenderer }} |
{% endif %}
<br/>
{% if typeParameters %}
    # &#128712; Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer }}
        <br/>
    {% endfor %}
{% endif %}
{% if parameters %}
        ## &#128966; Parameter(s)
        {% for p in parameters %}
        _**{{ p.name }}**_
        <br/>
        | Modifier(s)                              | Type                        | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
        |------------------------------------------|-----------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
        | {{ p.modifiers | join(', ','declare') }} | {{ p.type | typeRenderer }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |
        <br/>
    {% endfor %}
{% endif %}
`;
