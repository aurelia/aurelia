export const exportAssignmentTemplate = `
{% if comment %}
    # &#128366; Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# &#128712; Attribute(s)
| Default                        | Array                         |
|--------------------------------|-------------------------------|
| {{ isDefault | print_symbol }} | {{ isArray | print_symbol  }} |
<br/>
{% if newExpression %}
    # &#128712; New Expression
    | Name                     | Type                                    |
    |--------------------------|-----------------------------------------|
    | {{ newExpression.name }} | {{ newExpression.type | typeRenderer }} |
    <br/>
{% endif %}
{% if members %}
    # 🟆 Member(s)
    {% for m in members %}
        {{ m | memberRenderer }}
    {% endfor %}
{% endif %}
`;
