export const exportAssignmentTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# 🌟 Attribute(s)
| Default                        | Array                         |
|--------------------------------|-------------------------------|
| {{ isDefault | print_symbol }} | {{ isArray | print_symbol  }} |
<br/>
{% if newExpression %}
    # 🌟 New Expression
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
