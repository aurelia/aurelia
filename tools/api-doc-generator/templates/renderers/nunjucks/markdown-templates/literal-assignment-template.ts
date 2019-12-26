export const literalAssignmentTemplate = `
## {{ name | mdEscape }}
<br/>
{% if comment %}
    ## Summary
    {{ comment | commentRenderer}}
{% endif %}
<br/>
| Type                      | Shorthand                         | Spread                        |
|---------------------------|:---------------------------------:|:-----------------------------:|
| {{ type | typeRenderer }} | {{ isShorthand | print_symbol }}  | {{ isSpread | print_symbol }} |
<br/>
## Value
{{ value | memberRenderer }}
`;
