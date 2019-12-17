export const typeAliasTemplate = `
{% if comment %}
    # 🕮 Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
| Modifier(s)                            | Type                     |
|----------------------------------------|--------------------------|
| {{ modifiers | join(', ','declare') }} | {{ type | typeRenderer}} |
<br/>
{% if typeParameters %}
    # 🌟 Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer}}
        <br/>
    {% endfor %}
{% endif %}
{% if initializer %}
    # 🌟 Initializer
    {{ initializer }}
{% endif %}
`;
