import AutocompleteBase from "./base-autocomplete";

export default function CoachAutocomplete(props) {
  return (
    <AutocompleteBase
      {...props}
      cachedItems={props.cachedCoaches}
      fetchFn={props.fetchCoaches}
      onSelect={props.onCoachSelect}
      getItemLabel={(c) => c.fullName}
      getItemImage={(c) => c.profileImage}
      getItemMeta={() => "Director Técnico"}
    />
  );
}
