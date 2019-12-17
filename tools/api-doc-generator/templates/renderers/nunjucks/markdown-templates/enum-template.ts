export const enumTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Name       | Const                        |
|------------|:----------------------------:|
| {{ name }} | {{ isConst | print_symbol }} |
<br/>
{% if members %}
    # 🌟 Member(s)
    | Name         | Value         |
    |--------------|---------------|
    {% for m in members %}
        | {{ m.name }} | {{ m.value }} |
    {% endfor %}
{% endif %}
`;
