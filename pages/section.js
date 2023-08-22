import { LevelContext, levelContext } from "./levelContext";

export default function Section({level, children}){
    return (
        <section>
            <LevelContext.Provider value={level}>
                {children}
            </LevelContext.Provider>
        </section>
    );
}