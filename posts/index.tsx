import * as _ from 'lodash'

declare var require: any
function requireAll(requireContext: any): any[] {
  return requireContext.keys().map((key: string) => {
    var obj = requireContext(key)
    obj.slug = key.split('/')[1]
    return obj
  })
}
const posts = requireAll(require.context("../posts", true, /.md$/))
export default _.sortBy(posts, post => -new Date(post.date))