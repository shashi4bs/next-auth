import Section from "./section";
import Heading from "./heading";

export default function Page(){
    return (
        /* With Props
        <Section>
            <Heading level={1}>Title</Heading>
            <Section>
                <Heading level={2}>Sub Heading</Heading>
                <Heading level={4}>Sub sub Heading</Heading>
            </Section>
        </Section>
        */
    /** With context*/
    <Section level={1}>
        <Heading>Title</Heading>
        <Section level={6}>
            <Heading>App Studio</Heading>
            <Heading>App Studio</Heading>
        </Section>
    </Section>
    )
}