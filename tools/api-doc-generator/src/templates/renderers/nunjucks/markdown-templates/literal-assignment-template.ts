export const literalAssignmentTemplate = `
{% if comment %}
    ### &#128366; Summary
    {{ comment | commentRenderer}}
{% endif %}
<br/>
### {{ name }}
<br/>
| Type                      | Shorthand                         | Spread                        |
|---------------------------|:---------------------------------:|:-----------------------------:|
| {{ type | typeRenderer }} | {{ isShorthand | print_symbol }}  | {{ isSpread | print_symbol }} |
<br/>
### Value
{{ value | memberRenderer }}
`;
