export const literalCallSignatureTemplate = `
{% if returnType %}
#### Return Type
{{ returnType | typeRenderer}}
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
    ## 🟆 Parameter(s)
    {% for p in parameters %}
        | Name         | Modifier(s)                              | Type                        | Optional                           | Rest                          | Parameter Property                          | Initializer                       |
        |--------------|------------------------------------------|-----------------------------|:----------------------------------:|:-----------------------------:|:-------------------------------------------:|-----------------------------------|
        | {{ p.name }} | {{ p.modifiers | join(', ','declare') }} | {{ p.type | typeRenderer }} | {{ p.isOptional | print_symbol }}  | {{ p.isRest | print_symbol }} | {{ p.isParameterProperty  | print_symbol }} | {{ p.initializer | replaceWith }} |
        <br/>
    {% endfor %}
{% endif %}
`;
