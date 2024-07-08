// Comps
import Tag from '@/components/blog/Tag';

export default function TagsList({ tags }) {
  const filteredTags = tags.filter((tag) => tag.slug != 'blog');

  return (
    <>
      <div>
        {filteredTags.map((tag) => (
          <span key={tag.id} className="fr-mr-2v">
            <Tag tag={tag}></Tag>
          </span>
        ))}
      </div>
    </>
  );
}
