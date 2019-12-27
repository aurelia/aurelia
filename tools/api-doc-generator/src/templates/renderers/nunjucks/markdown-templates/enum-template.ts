export const enumTemplate = `
# {{ name | mdEscape }}
<br/>
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Const                        |
|:----------------------------:|
| {{ isConst | print_symbol }} |
<br/>
{% if members %}
    ## ✦ Member(s)
    | Name          | Value         |
    |---------------|---------------|
    {% for m in members %}
        | {{ m.name | mdEscape }} | {{ m.value }} |
    {% endfor %}
{% endif %}
`;
