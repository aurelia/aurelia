export const typeAliasTemplate = `
{% if comment %}
    # &#128366; Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
# {{ name | replaceWith }}
| Modifier(s)                            | Type                     |
|----------------------------------------|--------------------------|
| {{ modifiers | join(', ','declare') }} | {{ type | typeRenderer}} |
<br/>
{% if typeParameters %}
    # &#128712; Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer}}
        <br/>
    {% endfor %}
{% endif %}
{% if initializer %}
    # &#128712; Initializer
    {{ initializer }}
{% endif %}
`;
