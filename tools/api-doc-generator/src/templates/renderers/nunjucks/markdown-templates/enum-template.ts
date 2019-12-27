export const enumTemplate = `
{% if comment %}
    # &#128366; Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Name       | Const                        |
|------------|:----------------------------:|
| {{ name }} | {{ isConst | print_symbol }} |
<br/>
{% if members %}
    # &#128712; Member(s)
    | Name         | Value         |
    |--------------|---------------|
    {% for m in members %}
        | {{ m.name }} | {{ m.value }} |
    {% endfor %}
{% endif %}
`;
