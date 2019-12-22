export const typeAliasTemplate = `
# {{ name | mdEscape | replaceWith }}
<br/>
{% if comment %}
    ## ✦ Summary
    {{ comment | commentRenderer }}
{% endif %}
<br/>
| Modifier(s)                            | Type                     |
|----------------------------------------|--------------------------|
| {{ modifiers | join(', ','declare') }} | {{ type | typeRenderer}} |
<br/>
{% if typeParameters %}
    ## ✦ Type Parameter(s)
    {% for tp in typeParameters %}
        {{ tp | typeParameterRenderer}}
        <br/>
    {% endfor %}
{% endif %}
{% if initializer %}
    ## ✦ Initializer
    {{ initializer }}
{% endif %}
`;
