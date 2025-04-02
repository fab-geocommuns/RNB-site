// Comps
import Tag from '@/components/blog/Tag';

// @ts-ignore
export default function TagsList({ tags }) {
  // @ts-ignore
  const filteredTags = tags.filter((tag) => tag.slug != 'blog');

  return (
    <>
      <div>
        {filteredTags.map((tag: any) => (
          <span key={tag.id} className="fr-mr-2v">
            <Tag tag={tag}></Tag>
          </span>
        ))}
      </div>
    </>
  );
}
