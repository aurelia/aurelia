export const variableStatementTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# 🌟 Attribute(s)
| Modifier(s)                            |
|----------------------------------------|
| {{ modifiers | join(', ','declare') }} |
<br/>
{% if variables %}
    # 🌟 Variable(s)
    {% for v in variables %}
        {% if v.comment %}
            ### 🕮 Summary
            {{ v.comment | commentRenderer }}
        {% endif %}
        <br/>
        # {{ v.name | replaceWith }}
        <br/>
        | Type                        | Initializer                       |
        |-----------------------------|-----------------------------------|
        | {{ v.type | typeRenderer }} | {{ v.initializer | replaceWith }} |
        <br/>
    {% endfor %}
{% endif %}
{% if literals %}
    # 🌟 Literal(s)
    {% for l in literals %}
        {% if l.comment %}
            ## 🕮 Summary
            {{ l.comment | commentRenderer }}
        {% endif %}
        <br/>
        ## {{ l.name | replaceWith }}
        <br/>        
        | Type                        | Array                           |
        |-----------------------------|---------------------------------|
        | {{ l.type | typeRenderer }} | {{ l.isArray | print_symbol  }} |
        <br/>
        {% if l.members %}
            ## 🟆 Member(s)
            {% for m in l.members %}
                {{ m | memberRenderer }}
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
{% if destructuring %}
    # 🌟 Destructuring(s)
    {% for de in destructuring %}
        {% if de.comment %}
            ### 🕮 Summary
            {{ de.comment | commentRenderer }}
        {% endif %}
        <br/>
        | Initializer                        | Array                            |
        |------------------------------------|----------------------------------|
        | {{ de.initializer | replaceWith }} | {{ de.isArray | print_symbol  }} |
        <br/>
        {% if de.members %}
            ### 🟆 Member(s)
            {% for m in de.members %}
                {{ m | memberRenderer }}
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
`;
