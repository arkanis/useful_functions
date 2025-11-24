/**
 * Translates extended regular expression syntax to a normal JavaScript RegExp. Removes comments and whitespeaces to do so.
 * 
 * @param {string} pattern - The text of the regular expression. Usually it goes between the "/" characters.
 * @param {string} flags   - Flags of the RegExp, e.g. "g", "i" and so on.
 * @returns {RegExp} A normal JavaScript RegExp object.
 * 
 * Example:
 * 
 *     // A small extended RegExp for syntax highlighting purposes.
 *     // String.raw`…` because otherwise we have to escape all \ characters, which gets confusing fast. Escape ` with \u0060.
 *     // Comment "# key = value" is there to test lines that only contain a comment (they're removed).
 *     // The escaped space in "^ \ (?<name>" to test escaped whitespaces outside of character classes (they have to be retained).
 *     // Space in character class "[^\] ]" to test whitespaces in character class (they have to be retained).
 *     // The escaped # in "(?<comment> \# .* )" to test matching # instead of it starting a line comment.
 *     const regexp = extendedRegExp(String.raw`
 *         # key = value
 *         ^ \ (?<name> \w+ ) = (?<value> .+ )
 *     |   ^ (?<section> \[ [^\] ]* \] )  # [section]
 *     |   ^ (?<comment> \# .* )
 *     `, "gm")
 *     console.log(regexp)
 *     console.table(Array.from("[section_name]\n name=value\n# comment line".matchAll(regexp)).map(m => m.groups))
 * 
 * @license MIT
 */
export function extendedRegExp(pattern, flags = "") {
	// The plan: Remove comments and whitespaces. So we write a regexp that matches them. But we don't want to remove
	// whitespaces or "#" signs in character classes. So also match character classes in the regexp, but before comments and
	// whitespaces. Then only remove matches of comments and whitespaces and pass-through everything else.
	// Here it is in readable extended syntax, below how you have to write it in JavaScript.
	// /
	//     (?<charclass>  (?<!\\)\[ .*? (?<!\\)\] )  # Character classes, passed through. Captured here because we don't want to remove whitespaces in them.
	// |   (?<comment>    (?<!\\)# .*             )  # Comments, they'll be removed.
	// |   (?<whitespace> (?<!\\)\s+              )  # Whitespaces, also removed. But don't match an escaped whitespace because we don't want to remove those.
	// /gx
	const translationRegExp = /(?<charclass>(?<!\\)\[.*?(?<!\\)\])|(?<comment>(?<!\\)#.*)|(?<whitespace>(?<!\\)\s+)/g
	const translatedBody = pattern.replaceAll(translationRegExp, (matchText, charclass, comment, whitespace) => (comment || whitespace) ? "" : matchText)
	return new RegExp(translatedBody, flags)
}