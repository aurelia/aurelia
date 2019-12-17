export const literalAssignmentTemplate = `
{% if comment %}
    ### 🕮 Summary
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
