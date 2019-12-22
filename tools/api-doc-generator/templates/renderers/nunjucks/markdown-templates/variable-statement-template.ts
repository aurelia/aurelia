export const variableStatementTemplate = `
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
## ✦ Attribute(s)
| Modifier(s)                            |
|----------------------------------------|
| {{ modifiers | join(', ','declare') }} |
<br/>
{% if variables %}
    {% for v in variables %}
        # &nbsp;&nbsp; {{ v.name | mdEscape | replaceWith }}
        <br/>
        {% if v.comment %}
            ### &nbsp;&nbsp;&nbsp;&nbsp; Summary
            &nbsp;&nbsp;&nbsp;&nbsp; {{ v.comment | commentRenderer }}
        {% endif %}
        <br/>
        | Type                        | Initializer                       |
        |-----------------------------|-----------------------------------|
        | {{ v.type | typeRenderer }} | {{ v.initializer | replaceWith }} |
        <br/>
    {% endfor %}
{% endif %}
{% if literals %}
    {% for l in literals %}
        # &nbsp;&nbsp; {{ l.name | mdEscape | replaceWith }}
        {% if l.comment %}
            ### &nbsp;&nbsp;&nbsp;&nbsp; Summary
            &nbsp;&nbsp;&nbsp;&nbsp; {{ l.comment | commentRenderer }}
        {% endif %}
        <br/>
        | Type                        | Array                           |
        |-----------------------------|---------------------------------|
        | {{ l.type | typeRenderer }} | {{ l.isArray | print_symbol  }} |
        <br/>
        {% if l.members %}
            ### &nbsp;&nbsp;&nbsp;&nbsp; Member(s)
            {% for m in l.members %}
                {{ m | memberRenderer }}
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
{% if destructuring %}
    {% for de in destructuring %}
        {% if de.comment %}
            ### &nbsp;&nbsp;&nbsp;&nbsp; Summary
            &nbsp;&nbsp;&nbsp;&nbsp; {{ de.comment | commentRenderer }}
        {% endif %}
        <br/>
        | Initializer                        | Array                            |
        |------------------------------------|----------------------------------|
        | {{ de.initializer | replaceWith }} | {{ de.isArray | print_symbol  }} |
        <br/>
        {% if de.members %}
            ### Member(s)
            {% for m in de.members %}
                {{ m | memberRenderer }}
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endif %}
`;
