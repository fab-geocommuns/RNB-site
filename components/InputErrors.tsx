export default function InputErrors({errors}) {

    if (errors) {
        return (
            <>
            <p id="text-input-error-desc-error" class="fr-error-text">
                {errors.map((error, index) => {
                    return (
                        <span key={index}>
                            {error}
                            <br />
                        </span>
                    )
                })}
    </p>
    </>

        )
    } else {
        return <></>
    }


}